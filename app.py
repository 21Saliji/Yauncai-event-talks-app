import flask
from flask import Flask, jsonify, render_template
import feedparser
import re
from datetime import datetime

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def detect_type(title, content):
    """Detects type of release note based on title and content keywords."""
    combined = (title + " " + content).lower()
    if "deprecated" in combined or "deprecation" in combined or "support for" in combined and "end" in combined:
        return "Deprecation"
    elif "fix" in combined or "bug" in combined or "resolved" in combined or "issue" in combined:
        return "Bug Fix"
    elif "feature" in combined or "new" in combined or "introducing" in combined or "support" in combined or "preview" in combined or "generally available" in combined or "ga" in combined:
        return "Feature"
    elif "billing" in combined or "pricing" in combined or "cost" in combined:
        return "Pricing/Billing"
    return "Update"

def parse_date(date_str):
    """Parses and formats date from feed."""
    try:
        # GCP dates are usually like "2026-06-28T00:00:00Z"
        dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
        return dt.strftime("%B %d, %Y")
    except Exception:
        try:
            # Fallback
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            return dt.strftime("%B %d, %Y")
        except Exception:
            return date_str

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/notes")
def get_notes():
    try:
        feed = feedparser.parse(FEED_URL)
        notes = []
        
        for entry in feed.entries:
            title = entry.get("title", "No Title")
            
            # Content is usually in content[0].value or summary
            content = ""
            if "content" in entry and len(entry.content) > 0:
                content = entry.content[0].value
            elif "summary" in entry:
                content = entry.summary
                
            published_raw = entry.get("published", entry.get("updated", ""))
            published = parse_date(published_raw)
            link = entry.get("link", "")
            entry_id = entry.get("id", link)
            
            note_type = detect_type(title, content)
            
            notes.append({
                "id": entry_id,
                "title": title,
                "content": content,
                "published": published,
                "published_raw": published_raw,
                "link": link,
                "type": note_type
            })
            
        return jsonify({"success": True, "notes": notes})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
