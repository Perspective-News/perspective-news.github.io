# Perspective News Backend

This directory contains the backend logic for generating the data that
drives the Perspective News website. The backend is intentionally
decoupled from the frontend: it runs independently, fetches and
processes news articles, and writes the results into a JSON file in
`frontend/data/news.json`. The static frontend then consumes this
file at build or runtime to populate its news feed.

## Project Structure

```text
backend/
├── src/
│   ├── export.py     # Handles writing processed data to JSON
│   ├── process.py    # Contains the data processing pipeline
│   └── main.py       # Entry point to run the pipeline
├── requirements.txt  # Python dependencies for the backend
└── README.md         # You are here
```

## Running Locally

To run the backend locally and produce a fresh `news.json` file:

1. Create a virtual environment and install dependencies:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. Navigate to the `backend/src` directory and run the pipeline:

   ```bash
   cd backend/src
   python main.py
   ```

3. The script will generate a JSON file at `frontend/data/news.json` in the
   repository root. Open `frontend/index.html` in a browser to see the
   changes reflected.

## GitHub Actions Integration

A GitHub Actions workflow located at `.github/workflows/update-data.yml`
automates the data generation process. On a schedule (once per day) or
when manually triggered, the workflow will:

1. Check out the repository.
2. Set up Python and install backend dependencies.
3. Run `python backend/src/main.py` to generate the latest data.
4. Commit the updated JSON file to the repository.

This ensures that the website served by GitHub Pages always has
up‑to‑date information without requiring a dedicated server.

## Extending the Pipeline

The current implementation of `process.py` returns two sample events
for demonstration purposes. To adapt the backend to your needs:

* Replace the placeholder logic in `process.build_events()` with
  functions that fetch data from RSS feeds, APIs, or other sources.
* Perform any deduplication, clustering, or summarization needed to
  convert raw articles into coherent events.
* Ensure that each event dictionary you return matches the schema
  expected by the frontend (see `frontend/data/news.json` for a
  reference). At minimum you should include an `id`, `title`,
  `summary`, `topics`, `regions`, and a list of `sources` with
  `name` and `url` keys.

If you add new Python modules to the backend, remember to import and
expose them appropriately in `main.py` and update `requirements.txt`
with any additional third‑party dependencies.