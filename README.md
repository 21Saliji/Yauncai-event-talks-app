# BigQuery Release Notes Board & Share App

A modern web application built using Python Flask, vanilla HTML, CSS, and JavaScript. This application fetches, parses, and displays the official BigQuery Release Notes, with features to categorize updates and quickly share them to X (Twitter).

## 🚀 Features

- **Real-time Feed Loading**: Fetches directly from the official Google Cloud BigQuery RSS/Atom release notes feed.
- **Auto-Categorization**: Intelligently classifies update entries into categories (Features, Bug Fixes, Deprecations, Pricing/Billing, and General Updates) based on title and summary content.
- **Modern UI/UX**: Includes key metrics overview cards, dark/light theme switching, and responsive design.
- **Search & Filters**: Instantly filters updates using search queries or category pills.
- **One-click Share**: Drafts an optimized pre-formatted tweet with a character counter, opening X (Twitter) Intents when confirmed.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask, `feedparser`, `requests`
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (custom CSS variables), Vanilla JavaScript (ES6+)
- **Icons**: FontAwesome 6

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone git@github.com:21Saliji/Yauncai-event-talks-app.git
   cd Yauncai-event-talks-app
   ```

2. **Install dependencies**:
   Make sure you have Python 3 and pip installed. Run:
   ```bash
   pip install flask requests feedparser
   ```

3. **Run the application**:
   Start the Flask development server:
   ```bash
   python3 app.py
   ```

4. **Access the application**:
   Open your browser and navigate to `http://127.0.0.1:5000`.

---

## 📁 Project Structure

```text
bq-release-notes/
├── app.py                  # Flask entrypoint & feed parser API
├── templates/
│   └── index.html          # Web application structure & modal template
├── static/
│   ├── css/
│   │   └── style.css       # Custom styles, transitions, themes, and animations
│   └── js/
│       └── app.js          # Client-side filtering, state management, and Twitter modal logic
├── .gitignore              # Ignored files (venv, cache, local logs, etc.)
└── README.md               # Project documentation
```
