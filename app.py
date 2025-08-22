from flask import Flask, render_template, request, jsonify
from sentiment.core import analyze_text

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    # Allow extension and other frontends to call the API
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


@app.route("/", methods=["GET"]) 
def index():
    return render_template("index.html", result=None)


@app.route("/analyze", methods=["POST"]) 
def analyze_form():
    text = request.form.get("text", "")
    result = analyze_text(text)
    return render_template("index.html", result=result, original=text)


@app.route("/api/sentiment", methods=["POST", "OPTIONS"]) 
def api_sentiment():
    if request.method == "OPTIONS":
        # Preflight handled by after_request CORS headers
        return ("", 204)

    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    result = analyze_text(text)
    return jsonify({
        "sentiment": result["label"],
        "polarity": result["polarity"],
        "subjectivity": result["subjectivity"],
    })


if __name__ == "__main__":
    # Run development server
    app.run(host="127.0.0.1", port=5000, debug=True)
