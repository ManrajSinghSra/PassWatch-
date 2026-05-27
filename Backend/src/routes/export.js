const express = require('express');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Post = require('../models/Post');
const router = express.Router();

// CSV Export
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
    res.attachment('passwatch-posts.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PDF Export
router.get('/pdf', async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const posts = await Post.find({
      isGibberish: false,
      publishedAt: { $gte: yesterday }
    }).select('-embedding -translations').lean().limit(50);
    
    const doc = new PDFDocument();
    res.header('Content-Type', 'application/pdf');
    res.attachment('passwatch-posts.pdf');
    doc.pipe(res);
    
    doc.fontSize(20).text('PassWatch — Passport Posts', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);
    
    posts.forEach((p, i) => {
      doc.fontSize(12).fillColor('black').text(`${i + 1}. ${p.title}`, { underline: true });
      doc.fontSize(9).fillColor('gray').text(`${p.platform} · ${p.category} · ${p.sentiment}`);
      doc.fontSize(10).fillColor('black').text(p.summary || p.content?.slice(0, 200) || '');
      doc.fontSize(8).fillColor('blue').text(p.url, { link: p.url });
      doc.moveDown();
    });
    
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;