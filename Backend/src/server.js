require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postsRoutes = require('./routes/posts');
const exportRoutes = require('./routes/export');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/posts', postsRoutes);
app.use('/api/export', exportRoutes);

app.get('/', (req, res) => res.json({ 
  status: 'PassWatch API running',
  endpoints: {
    posts: '/api/posts',
    stats: '/api/posts/stats',
    translate: 'POST /api/posts/translate',
    scrape: 'POST /api/posts/scrape',
    exportCsv: '/api/export/csv',
    exportPdf: '/api/export/pdf'
  }
}));

// Local dev only (Vercel doesn't run app.listen)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    const startCronJobs = require('./jobs/cron');
    startCronJobs();
  });
}

module.exports = app;