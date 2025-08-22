# Sentiment Analysis Web App

A multi-faceted sentiment analysis project with:

- Web app (Flask + HTML/CSS)
- JSON API (for programmatic use and the browser extension)
- Chrome extension (Manifest V3) to analyze selected or pasted text

Core analysis uses VADER as the primary analyzer (great for short/social text), with TextBlob as a fallback. The API returns the final label plus polarity/subjectivity.

## Requirements
- Python 3.9+
- Chrome (for the extension)

## Setup
```powershell
# From the project directory
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run the Flask app
```powershell
python app.py
# App will run on http://127.0.0.1:5000/
```

## Web App
Open http://127.0.0.1:5000/ and paste text to analyze.

## API
```
POST /api/sentiment
Content-Type: application/json
{
  "text": "I love this!"
}
```
Response:
```json
{
  "sentiment": "Positive",
  "polarity": 0.625,
  "subjectivity": 0.6
}
```

CORS headers are enabled for convenience so the Chrome extension can call the API.

## Chrome Extension (MV3)
You can use the extension in two modes:

- Development (local API): run the Flask app locally, the extension will fall back to `http://127.0.0.1:5000` if production is unreachable.
- Production (Vercel API): no local server required; the extension tries your deployed API first.

Setup:
1. In Chrome, go to chrome://extensions
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select the `extension/` folder
4. Pin the extension. Use it in any of these ways:
   - Select text on a page and click the floating blue button that appears near the selection. The popup opens (or a tooltip appears inline) with the analysis.
   - Or click the extension icon to open the popup, then:
     - Use "Analyze Selection" to fetch selected text from the current tab
     - Or paste/enter text and click "Analyze Input"

Notes:
- The extension is configured to call production first: `https://sentanalysis.vercel.app/api/sentiment`, then fall back to local: `http://127.0.0.1:5000/api/sentiment`.
- The in-page floating button is injected by `content.js`; if the popup cannot be opened (e.g., on Edge), it shows an inline tooltip result instead.
- Internal browser pages (chrome://, edge://, about:, extension pages) are restricted. Use the extension on normal sites.
- After changing any extension files, reload it from chrome://extensions (or edge://extensions).

## Notes
- The project uses VADER primarily, with TextBlob fallback, implemented in `sentiment/core.py`.
- For production, consider stricter CORS and authentication.

## Deploy to Vercel (Serverless)
This project is configured to run on Vercel's Python Runtime as a serverless WSGI app.

What was added:
- `vercel.json` routes all incoming requests to `api/index.py`.
- `api/index.py` exports the Flask `app`, which Vercel detects as a WSGI application.

Steps:
1. Ensure you have a Git repo (GitHub/GitLab/Bitbucket) for this folder.
2. Push your code and import the repo in Vercel (https://vercel.com/new).
3. Vercel detects Python, installs `requirements.txt`, and deploys.
4. After deploy, your app will be available at `https://<your-project>.vercel.app/`.

Verify after deploy:
- Open your site root, e.g. `https://sentanalysis.vercel.app/`.
- Test the API directly:
  ```powershell
  Invoke-WebRequest -Uri https://sentanalysis.vercel.app/api/sentiment -Method POST `
    -Body (@{text="I love this!"} | ConvertTo-Json) `
    -ContentType "application/json"
  ```

Local test with Vercel CLI (optional):
```powershell
npm i -g vercel
vercel dev
# Visit http://localhost:3000
```

Extension after deploy:
- Ensure `extension/manifest.json` `host_permissions` includes your production URL, e.g. `"https://<your-project>.vercel.app/*"` (already includes `https://sentanalysis.vercel.app/*`).
- The extension's `popup.js` already tries your production URL first. If you fork/rename, update the domain there.

Microsoft Edge:
- Load unpacked via edge://extensions and enable Developer mode.
- Allow the extension on all sites and (optionally) in InPrivate.
- If opening the popup fails, the floating button falls back to inline analysis tooltip.
