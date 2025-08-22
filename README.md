# Sentiment Analysis Web App

A multi-faceted sentiment analysis project with:

- Web app (Flask + HTML/CSS)
- JSON API (for programmatic use and the browser extension)
- Chrome extension (Manifest V3) to analyze selected or pasted text

Core analysis uses TextBlob.

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
1. Start the Flask app first (see above).
2. In Chrome go to chrome://extensions
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the `extension/` folder
5. Pin the extension. Click it to analyze text:
   - Use "Analyze Selection" to fetch selected text from the current tab
   - Or paste/enter text and click "Analyze Input"

## Notes
- The project uses TextBlob which is simple and effective for general sentiment. You can later swap to VADER or NLTK-based approaches inside `sentiment/core.py`.
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

Local test with Vercel CLI (optional):
```powershell
npm i -g vercel
vercel dev
# Visit http://localhost:3000
```

Extension after deploy:
- Update `extension/manifest.json` `host_permissions` to include your production URL, e.g. `"https://<your-project>.vercel.app/*"`.
- The extension's `popup.js` `API_URLS` can be updated to try your production URL first.
