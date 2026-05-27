require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const postsRoutes = require('./routes/posts');
const exportRoutes = require('./routes/export');

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      const startCronJobs = require('./jobs/cron');
      startCronJobs();
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => console.error(err));
process.on('uncaughtException', (err) => console.error(err));

startServer();