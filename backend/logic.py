"""
End-to-end news ingestion pipeline for Perspective News.

This module:
- reads sources from frontend/data/sources.csv
- fetches & processes articles
- clusters them into events
- writes frontend/data/news.json
"""

from __future__ import annotations

import re
import json
import time
import hashlib
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
from pathlib import Path

import requests
import pandas as pd
import feedparser
import numpy as np
from bs4 import BeautifulSoup
import trafilatura
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_similarity
from keybert import KeyBERT


# ======================================================
# PATHS (repo-structure aware)
# ======================================================

BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent
DATA_DIR = REPO_ROOT / "frontend" / "data"

SOURCES_PATH = DATA_DIR / "sources.csv"
OUTPUT_PATH = DATA_DIR / "news.json"


# ======================================================
# CONFIGURATION
# ======================================================

DEFAULT_WEBSITE_LINK_IF_MISSING = "https://youtube.com"
DEFAULT_SOURCE_NAME_IF_MISSING = "unknown"

USER_AGENT = "PerspectiveNewsPipeline/1.0"
REQUEST_TIMEOUT = 15
SLEEP_BETWEEN_REQUESTS_SEC = 0.2

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CLUSTER_DISTANCE_THRESHOLD = 0.35

SUMMARY_WORD_MIN = 50
SUMMARY_WORD_MAX = 60


# ======================================================
# UTILITIES
# ======================================================

def safe_get(url: str) -> Optional[str]:
    try:
        r = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT,
        )
        if r.status_code >= 400:
            return None
        return r.text
    except Exception:
        return None


def normalize_whitespace(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def derive_title_fallback(url: str, content: Optional[str]) -> str:
    if url:
        path = urlparse(url).path
        slug = path.strip("/").split("/")[-1]
        slug = re.sub(r"[-_]+", " ", slug)
        slug = re.sub(r"\.[a-zA-Z0-9]+$", "", slug)
        slug = normalize_whitespace(slug)
        if slug:
            return slug[:120]

    if content:
        first = normalize_whitespace(content.split(".")[0])
        if len(first) >= 8:
            return first[:120]

    return "untitled"


def hash_article(source: str, url: str, title: str) -> str:
    key = f"{source}|{url}|{title}".encode("utf-8", errors="ignore")
    return hashlib.sha256(key).hexdigest()[:16]


def extract_links_from_html(html: str) -> List[str]:
    soup = BeautifulSoup(html, "lxml")
    links = [a.get("href") for a in soup.select("a[href]") if a.get("href", "").startswith("http")]
    return list(dict.fromkeys(links))


def extract_article_content(url: str) -> Optional[str]:
    html = safe_get(url)
    if not html:
        return None

    text = trafilatura.extract(
        html,
        include_comments=False,
        include_tables=False,
        favor_recall=True,
    )

    if not text:
        return None

    text = normalize_whitespace(text)
    return text if len(text.split()) >= 40 else None


# ======================================================
# DATA STRUCTURES
# ======================================================

@dataclass
class RawArticle:
    source_name: str
    website_link: str
    title: Optional[str]
    content: Optional[str]


# ======================================================
# INGESTION
# ======================================================

def fetch_from_rss(source_name: str, feed_url: str, max_items: int) -> List[RawArticle]:
    feed = feedparser.parse(feed_url)
    out: List[RawArticle] = []

    for entry in feed.entries[:max_items]:
        link = getattr(entry, "link", None)
        if not link:
            continue

        out.append(
            RawArticle(
                source_name=source_name,
                website_link=link,
                title=getattr(entry, "title", None),
                content=extract_article_content(link),
            )
        )
        time.sleep(SLEEP_BETWEEN_REQUESTS_SEC)

    return out


def fetch_from_url_list(source_name: str, list_url: str, max_items: int) -> List[RawArticle]:
    text = safe_get(list_url)
    if not text:
        return []

    urls = (
        extract_links_from_html(text)
        if "<html" in text.lower()
        else [l for l in text.splitlines() if l.startswith("http")]
    )[:max_items]

    out = []
    for link in urls:
        out.append(
            RawArticle(
                source_name=source_name,
                website_link=link,
                title=None,
                content=extract_article_content(link),
            )
        )
        time.sleep(SLEEP_BETWEEN_REQUESTS_SEC)

    return out


def load_sources() -> pd.DataFrame:
    df = pd.read_csv(SOURCES_PATH, encoding="utf-8-sig")
    df.columns = [c.strip() for c in df.columns]

    required = {"source_name", "source_type", "source_url"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"sources.csv missing columns: {missing}")

    return df


def ingest_all_sources(df: pd.DataFrame, max_items: int) -> pd.DataFrame:
    rows: List[Dict[str, Any]] = []

    for _, r in df.iterrows():
        name = r.get("source_name") or DEFAULT_SOURCE_NAME_IF_MISSING
        kind = str(r.get("source_type", "")).lower()
        url = r.get("source_url")

        if not url:
            continue

        if kind == "rss":
            arts = fetch_from_rss(name, url, max_items)
        elif kind == "url_list":
            arts = fetch_from_url_list(name, url, max_items)
        else:
            continue

        for a in arts:
            rows.append(a.__dict__)

    return pd.DataFrame(rows)


# ======================================================
# PROCESSING / CLUSTERING
# ======================================================

def clean_articles(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["content"]).copy()
    df["content"] = df["content"].apply(normalize_whitespace)

    df["title"] = df["title"].fillna("")
    df.loc[df["title"] == "", "title"] = df.apply(
        lambda r: derive_title_fallback(r["website_link"], r["content"]),
        axis=1,
    )

    df["article_id"] = df.apply(
        lambda r: hash_article(r["source_name"], r["website_link"], r["title"]),
        axis=1,
    )

    return df.drop_duplicates("article_id").reset_index(drop=True)


def embed_texts(texts: List[str]) -> np.ndarray:
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=True)


def cluster_articles(embeddings: np.ndarray) -> np.ndarray:
    distances = 1 - cosine_similarity(embeddings)
    model = AgglomerativeClustering(
        metric="precomputed",
        linkage="average",
        distance_threshold=CLUSTER_DISTANCE_THRESHOLD,
        n_clusters=None,
    )
    return model.fit_predict(distances)


def build_events(df: pd.DataFrame, labels: np.ndarray) -> List[Dict[str, Any]]:
    df["event_id"] = labels
    kw = KeyBERT(SentenceTransformer(EMBEDDING_MODEL_NAME))

    events = []
    for eid, g in df.groupby("event_id"):
        docs = g["content"].tolist()

        name = pick_event_name(docs, kw)
        summary = summarize_50_60_words(docs)

        events.append({
            "event_id": int(eid),
            "event_name": name,
            "summary_50_60_words": summary,
            "sources": g[["source_name", "website_link", "title", "article_id"]].to_dict("records"),
            "num_articles": int(len(g)),
        })

    return sorted(events, key=lambda e: e["num_articles"], reverse=True)


# ======================================================
# PUBLIC ENTRYPOINT
# ======================================================

def run_pipeline(max_items_per_source: int = 50) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    sources = load_sources()
    raw = ingest_all_sources(sources, max_items_per_source)
    clean = clean_articles(raw)

    if clean.empty:
        OUTPUT_PATH.write_text(json.dumps({"events": []}, indent=2))
        return

    texts = (clean["title"] + ". " + clean["content"].str[:1200]).tolist()
    embeddings = embed_texts(texts)
    labels = cluster_articles(embeddings)

    events = build_events(clean, labels)

    payload = {
        "generated_at_unix": int(time.time()),
        "num_articles": int(len(clean)),
        "num_events": int(len(events)),
        "events": events,
    }

    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
