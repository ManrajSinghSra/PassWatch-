# 🛂 PassWatch — Passport Social Media Intelligence Dashboard

> Built for the **Zebvo Newswire** full-stack development assessment

A real-time social media scraper that aggregates, categorizes, and analyzes passport-related content from multiple platforms using AI/NLP. Posts are processed through OpenAI's GPT-4o-mini for classification, summarization, sentiment analysis, and semantic clustering — then served through a clean React dashboard with 10-language translation and CSV/PDF export.

---

## 🌐 Live Demo

- **Dashboard:** https://passwatch-seven.vercel.app/
- **API:** https://passwatch-api.onrender.com
- **Postman Collection:** Import `PassWatch_API.postman_collection.json`

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

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **AI/NLP** | OpenAI GPT-4o-mini (categorisation, summary, sentiment, embeddings) |
| **Scraping** | Reddit API, YouTube Data API, HackerNews API, Google News RSS |
| **Scheduling** | node-cron (every 30 mins) |
| **Export** | PDFKit, json2csv |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🏗 Architecture

```
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────┐
│  React Frontend  │ ──────▶│  Express.js Backend   │ ──────▶│   MongoDB   │
│  (Vercel)        │◀────── │  (Render)             │        │   Atlas     │
└─────────────────┘        └──────────────────────┘        └─────────────┘
                                       │
                     ┌─────────────────┼─────────────────┐
                     ▼                 ▼                   ▼
              Reddit API         YouTube API          HackerNews
              Google News        OpenAI GPT-4o-mini   node-cron
```

**Data Flow:**
1. Cron job triggers every 30 mins → scrapes Reddit, YouTube, HackerNews, News
2. Raw posts sent to OpenAI GPT-4o-mini → categorised, summarised, sentiment tagged, gibberish filtered
3. Embeddings generated → cosine similarity clustering (threshold 0.85)
4. Processed posts saved to MongoDB
5. React frontend fetches via REST API with filters/search
6. On-demand translation via OpenAI when user clicks translate

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- OpenAI API key
- YouTube Data API key

### Backend
```bash
cd Backend
npm install
```

Create `.env` in Backend folder:
```
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
YOUTUBE_API_KEY=your_youtube_key
PORT=5000
```

```bash
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
```

Create `.env` in Frontend folder:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Open `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Fetch posts with filters |
| GET | `/api/posts/stats` | Get platform/category stats |
| POST | `/api/posts/translate` | Translate a post |
| POST | `/api/posts/scrape` | Trigger manual scrape |
| GET | `/api/export/csv` | Export filtered posts as CSV |
| GET | `/api/export/pdf` | Export filtered posts as PDF |

### Query Params for `GET /api/posts`
```
?platform=reddit        filter by platform
?category=Visa          filter by category
?sentiment=Positive     filter by sentiment
?search=passport        keyword search
?limit=100              results per page
?page=1                 page number
```

### POST `/api/posts/translate` Body
```json
{
  "postId": "abc123",
  "targetLanguage": "hindi"
}
```

---

## 📁 Project Structure

```
PassWatch-/
├── Backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── jobs/           # Cron scraper
│   │   ├── routes/         # API routes
│   │   └── server.js       # Entry point
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Dashboard pages
│   │   └── main.jsx        # Entry point
│   └── package.json
├── PassWatch_API.postman_collection.json
└── README.md
```

---

## 📝 Notes

- Twitter/X, Instagram, LinkedIn, and TikTok require paid API access and were not included
- Free tier on Render may cause cold starts (~30s delay on first request)
- OpenAI API costs apply for summarisation, categorisation, and translation