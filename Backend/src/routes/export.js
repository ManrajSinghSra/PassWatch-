const express = require('express');
const { Parser } = require('json2csv');
const Post = require('../models/Post');
const router = express.Router();

router.get('/csv', async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const posts = await Post.find({
      isGibberish: false,
      publishedAt: { $gte: yesterday }
    }).select('-embedding -translations').lean();
    
    const fields = ['platform', 'author', 'title', 'summary', 'category', 'sentiment', 'url', 'publishedAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(posts);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('zebvo-posts.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;