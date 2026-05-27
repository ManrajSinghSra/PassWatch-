const express = require('express');
const Post = require('../models/Post');
const { translateText } = require('../nlp/translator');
const runAllScrapers = require('../scrapers');
const router = express.Router();

// GET /api/posts - List posts with filters
router.get('/', async (req, res) => {
  try {
    const {
      platform, category, sentiment, search, author,
      minLikes, sort = 'publishedAt', order = 'desc',
      page = 1, limit = 20
    } = req.query;
    
    const filter = { isGibberish: false };
    if (platform) filter.platform = platform;
    if (category) filter.category = category;
    if (sentiment) filter.sentiment = sentiment;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (minLikes) filter['engagement.likes'] = { $gte: parseInt(minLikes) };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    filter.publishedAt = { $gte: yesterday };
    
    const posts = await Post.find(filter)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .select('-embedding');
    
    const total = await Post.countDocuments(filter);
    
    res.json({ posts, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posts/stats - Aggregate statistics
router.get('/stats', async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [platformStats, categoryStats, total] = await Promise.all([
      Post.aggregate([
        { $match: { isGibberish: false, publishedAt: { $gte: yesterday } } },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ]),
      Post.aggregate([
        { $match: { isGibberish: false, publishedAt: { $gte: yesterday } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Post.countDocuments({ isGibberish: false, publishedAt: { $gte: yesterday } })
    ]);
    
    res.json({ total, platforms: platformStats, categories: categoryStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/translate - Translate a post
router.post('/translate', async (req, res) => {
  try {
    const { postId, targetLang } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    if (post.translations.get(targetLang)) {
      return res.json({ translation: post.translations.get(targetLang) });
    }
    
    const translation = await translateText(
      `${post.title}\n\n${post.summary || post.content}`,
      targetLang
    );
    
    post.translations.set(targetLang, translation);
    await post.save();
    
    res.json({ translation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/scrape - Manually trigger scraping
router.post('/scrape', async (req, res) => {
  res.json({ status: 'Scraping triggered', message: 'Check back in 30-60 seconds for new posts' });
  // Run in background
  runAllScrapers().catch(console.error);
});

module.exports = router;