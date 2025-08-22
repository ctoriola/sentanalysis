from textblob import TextBlob
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _vader = SentimentIntensityAnalyzer()
except Exception:  # pragma: no cover - fallback if not installed
    _vader = None


def _label_from_score(score: float) -> str:
    if score > 0.05:
        return "Positive"
    if score < -0.05:
        return "Negative"
    return "Neutral"


def analyze_text(text: str) -> dict:
    """
    Analyze sentiment of text.

    Primary: VADER (compound) for better handling of short/snacky text.
    Fallback: TextBlob (polarity/subjectivity).

    Returns keys used by app:
    - polarity: overall polarity (VADER compound if available else TextBlob polarity)
    - subjectivity: TextBlob subjectivity (0..1), 0.0 if unavailable
    - label: Positive | Negative | Neutral (based on `polarity` thresholds)
    - extras (optional): { vader: {...}, textblob: {...} }
    """
    if not isinstance(text, str):
        raise TypeError("text must be a string")

    cleaned = text.strip()
    if not cleaned:
        return {"polarity": 0.0, "subjectivity": 0.0, "label": "Neutral"}

    # TextBlob analysis (always available given dependency)
    blob = TextBlob(cleaned)
    tb_polarity = float(blob.sentiment.polarity)
    tb_subjectivity = float(blob.sentiment.subjectivity)

    # VADER analysis if available
    if _vader is not None:
        vscores = _vader.polarity_scores(cleaned)
        v_compound = float(vscores.get("compound", 0.0))
        label = _label_from_score(v_compound)
        return {
            "polarity": v_compound,
            "subjectivity": tb_subjectivity,
            "label": label,
            "extras": {
                "vader": vscores,
                "textblob": {"polarity": tb_polarity, "subjectivity": tb_subjectivity},
            },
        }

    # Fallback to TextBlob-only
    label = _label_from_score(tb_polarity)
    return {
        "polarity": tb_polarity,
        "subjectivity": tb_subjectivity,
        "label": label,
        "extras": {"textblob": {"polarity": tb_polarity, "subjectivity": tb_subjectivity}},
    }
