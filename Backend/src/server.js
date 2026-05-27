require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const postsRoutes = require('./routes/posts');
const exportRoutes = require('./routes/export');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://passwatch-seven.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],

  credentials: true
}));

app.options('*', cors());

app.use(express.json());

connectDB();

app.use('/api/posts', postsRoutes);
app.use('/api/export', exportRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'PassWatch API running',
    endpoints: {
      posts: '/api/posts',
      stats: '/api/posts/stats',
      translate: 'POST /api/posts/translate',
      scrape: 'POST /api/posts/scrape',
      exportCsv: '/api/export/csv',
      exportPdf: '/api/export/pdf'
    }
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);

    const startCronJobs = require('./jobs/cron');
    startCronJobs();
  });
}

module.exports = app;