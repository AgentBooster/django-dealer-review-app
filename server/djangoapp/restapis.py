import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv('backend_url')
if not backend_url or backend_url == "your backend url":
    backend_url = "http://localhost:3030"

sentiment_analyzer_url = os.getenv('sentiment_analyzer_url')
if not sentiment_analyzer_url or sentiment_analyzer_url == "your code engine deployment url":
    sentiment_analyzer_url = "http://localhost:5050/"


def _normalize_url(url):
    return url.rstrip("/")


def get_request(endpoint, **kwargs):
    request_url = f"{_normalize_url(backend_url)}{endpoint}"
    params = kwargs.get("params", {})
    response = requests.get(request_url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def _fallback_sentiment(text):
    positive_words = {
        "amazing", "awesome", "excellent", "fantastic", "friendly",
        "good", "great", "helpful", "perfect", "super", "wonderful",
        "excelente", "fantastico", "fantásticos", "fantastico",
    }
    negative_words = {
        "awful", "bad", "horrible", "poor", "terrible", "worst",
        "mal", "malo", "pesimo", "pésimo",
    }

    words = {word.strip(".,!?").lower() for word in text.split()}
    if words & negative_words:
        return "negative"
    if words & positive_words:
        return "positive"
    return "neutral"


def analyze_review_sentiments(text):
    request_url = f"{_normalize_url(sentiment_analyzer_url)}/analyze/{quote(text)}"
    try:
        response = requests.get(request_url, timeout=10)
        response.raise_for_status()
        return response.json().get("sentiment", "neutral")
    except requests.RequestException:
        return _fallback_sentiment(text)


def post_review(data_dict):
    request_url = f"{_normalize_url(backend_url)}/insert_review"
    response = requests.post(request_url, json=data_dict, timeout=10)
    response.raise_for_status()
    return response.json()
