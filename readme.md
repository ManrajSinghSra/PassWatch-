# 🛂 PassWatch — Passport Social Media Intelligence Dashboard

> Built for the **Zebvo Newswire** full-stack development assessment

A real-time social media scraper that aggregates, categorizes, and analyzes passport-related content from multiple platforms using AI/NLP. Posts are processed through OpenAI's GPT-4o-mini for classification, summarization, sentiment analysis, and semantic clustering — then served through a clean React dashboard with 10-language translation and CSV/PDF export.

---

## 🌐 Live Demo

- **Dashboard:** [https://passwatch.vercel.app](https://your-frontend-url.vercel.app) 
- **API:** [https://passwatch-api.onrender.com](https://your-backend-url.onrender.com)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Real-time scraping** | Cron job every 30 minutes, filters last 24 hours of content |
| **Multi-platform** | Reddit (8 subreddits), YouTube Data API, HackerNews, Google News RSS |
| **Auto-categorisation** | 10 categories: Application, Renewal, Appointments, Tatkal, Visa, Travel Issues, Government Announcements, Scams/Fraud, News, Personal Experiences |
| **Gibberish filter** | GPT-4o-mini classifies and removes spam/bot content |
| **AI Summary** | ~30-word AI-generated summary per post |
| **Sentiment analysis** | Positive / Neutral / Negative classification |
| **Semantic clustering** | Groups similar/duplicate posts using OpenAI embeddings + cosine similarity (threshold 0.85) |
| **10-language translation** | English, Hindi, Punjabi, Spanish, French, German, Arabic, Chinese, Russian, Japanese — on-demand with caching |
| **Advanced filters** | Platform, category, sentiment, author, engagement threshold, search |
| **CSV + PDF Export** | Download filtered results in both formats |
| **Manual refresh** | Trigger on-demand scrape from the dashboard |

---     