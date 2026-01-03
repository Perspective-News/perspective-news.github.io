# Perspective News

This repository hosts the **Perspective News** project: a simple but
powerful approach to publishing curated news events using a static
frontend and a self‑contained backend. The frontend is served by
GitHub Pages, while the backend generates a JSON data file that the
frontend consumes to populate the news feed.

## Repository Layout

```text
.
├── frontend/                # Static website served via GitHub Pages
│   ├── index.html           # Homepage
│   ├── about.html           # About page
│   ├── privacy.html         # Privacy policy
│   ├── how-it-works.html    # Methodology page
│   ├── css/                 # Stylesheets
│   ├── js/                  # Client‑side scripts
│   ├── assets/              # Images and other static assets
│   └── data/                # Generated JSON and CSV data
│       ├── news.json        # Output from the backend pipeline
│       └── sources.csv      # List of news sources (static)
│
├── backend/                 # Data processing logic
│   ├── src/
│   │   ├── main.py          # Entry point to run the pipeline
│   │   ├── process.py       # Builds event data (placeholder)
│   │   └── export.py        # Writes JSON to the frontend
│   ├── requirements.txt     # Python dependencies for the backend
│   └── README.md            # Backend instructions
│
├── .github/workflows/       # GitHub Actions workflows
│   └── update-data.yml      # Automates backend runs and commits
│
├── .gitignore               # Untracked file patterns
└── README.md                # This file
```

## How It Works

1. **Frontend** — The `frontend` directory contains a purely static
   website. Pages are written in HTML, styled with CSS, and scripted
   with vanilla JavaScript. The homepage loads news events from
   `data/news.json` and displays them to users. The site can be
   deployed via GitHub Pages by pointing the Pages source to the
   `frontend/` folder.

2. **Backend** — The `backend` directory holds a small Python
   application that fetches and processes news data. When run (either
   manually or via GitHub Actions), it writes its output to
   `frontend/data/news.json`. The current implementation generates
   placeholder events, but you can extend it to fetch real data from
   RSS feeds, APIs or web scraping.

3. **Data Flow** — There is no traditional API or web server: the
   backend writes a JSON file to disk, the static site fetches it
   via a relative path, and the UI renders the content. This pattern
   keeps hosting simple and free while still allowing dynamic data.

4. **Automation** — A scheduled GitHub Action (`update-data.yml`)
   runs the backend each day at 5 AM UTC. It installs the Python
   dependencies, runs `python backend/src/main.py` to refresh the
   JSON file, and commits the updated file back into the repository.
   You can also trigger the workflow manually from the GitHub
   interface.

## Local Development

If you want to work on the project locally:

1. Clone or download the repository.
2. Open `frontend/index.html` directly in your browser to test the
   frontend.
3. To modify or extend the backend, set up a Python environment:

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cd src
   python main.py
   ```

   After running, refresh the JSON file by loading the updated
   `frontend/data/news.json` in your browser.

## Contributing

Pull requests are welcome! Please ensure any new Python dependencies
are added to `backend/requirements.txt`, and keep the frontend as
lightweight as possible. If you add new assets, place them under
`frontend/assets/`. For bug reports or feature requests, open an
issue on GitHub.

## License

This project is provided under the MIT License. See the `LICENSE`
file for details.