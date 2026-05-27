const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  platformId: { type: String, unique: true, required: true },
  author: String,
  title: String,
  content: String,
  url: String,
  publishedAt: Date,
  engagement: {
    likes: Number,
    comments: Number,
    shares: Number
  },
  language: { type: String, default: 'en' },
  region: String,
  
  isGibberish: { type: Boolean, default: false },
  category: String,
  summary: String,
  sentiment: String,
  embedding: { type: [Number], default: [] },
  clusterId: String,
  translations: {
    type: Map,
    of: String,
    default: {}
  },
  
  createdAt: { type: Date, default: Date.now }
});

postSchema.index({ category: 1, platform: 1, publishedAt: -1 });
postSchema.index({ clusterId: 1 });

module.exports = mongoose.model('Post', postSchema);