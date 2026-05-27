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
  ]

}));

app.options('*', cors({
  origin: allowedOrigins
}));

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

    console.log('========== ENV CHECK ==========');

    console.log('NODE_ENV:', process.env.NODE_ENV);

    console.log(
      'MONGODB_URI exists:',
      !!process.env.MONGODB_URI
    );

    console.log(
      'PORT:',
      process.env.PORT
    );

    console.log('===============================');

    await connectDB();

    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {

      console.log(`✅ Server running on port ${PORT}`);

      const startCronJobs = require('./jobs/cron');

      startCronJobs();

    });

  } catch (err) {

    console.error('❌ FULL STARTUP ERROR ❌');

    console.error(err);

    process.exit(1);

  }

}

process.on('unhandledRejection', (err) => {

  console.error('❌ Unhandled Rejection ❌');

  console.error(err);

});

process.on('uncaughtException', (err) => {

  console.error('❌ Uncaught Exception ❌');

  console.error(err);

});

startServer();