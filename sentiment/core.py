from textblob import TextBlob


def analyze_text(text: str) -> dict:
    """
    Analyze the sentiment of the provided text using TextBlob.

    Returns a dict with:
    - polarity: float in [-1.0, 1.0]
    - subjectivity: float in [0.0, 1.0]
    - label: "Positive" | "Negative" | "Neutral"
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    cleaned = text.strip()
    if not cleaned:
        return {"polarity": 0.0, "subjectivity": 0.0, "label": "Neutral"}

    blob = TextBlob(cleaned)
    polarity = float(blob.sentiment.polarity)
    subjectivity = float(blob.sentiment.subjectivity)

    if polarity > 0.05:
        label = "Positive"
    elif polarity < -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "label": label,
    }
