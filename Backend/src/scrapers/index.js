const scrapeReddit = require('./reddit');
const scrapeHackerNews = require('./hackernews');
const scrapeNews = require('./news');
const scrapeYouTube = require('./youtube');
const Post = require('../models/Post');
const { processBatch } = require('../nlp/processor');
const { clusterPosts } = require('../nlp/clusterer');

async function runAllScrapers() {
  console.log('🔍 Starting scrape...');
  const startTime = Date.now();
  
  const [redditPosts, hnPosts, newsPosts, ytPosts] = await Promise.all([
    scrapeReddit().catch(e => { console.error('Reddit failed:', e.message); return []; }),
    scrapeHackerNews().catch(e => { console.error('HN failed:', e.message); return []; }),
    scrapeNews().catch(e => { console.error('News failed:', e.message); return []; }),
    scrapeYouTube().catch(e => { console.error('YT failed:', e.message); return []; })
  ]);
  
  const allPosts = [...redditPosts, ...hnPosts, ...newsPosts, ...ytPosts];
  console.log(`📥 Total scraped: ${allPosts.length} posts`);
  
  if (allPosts.length === 0) return;
  
  const existing = await Post.find({
    platformId: { $in: allPosts.map(p => p.platformId) }
  }).select('platformId').lean();
  
  const existingSet = new Set(existing.map(p => p.platformId));
  const newPosts = allPosts.filter(p => !existingSet.has(p.platformId));
  
  console.log(`✨ ${newPosts.length} new posts to process`);
  
  if (newPosts.length === 0) return;
  
  const processed = await processBatch(newPosts);
  
  let saved = 0;
  for (const post of processed) {
    if (post.isGibberish) continue;
    try {
      await Post.create(post);
      saved++;
    } catch (err) {
      // skip duplicates
    }
  }
  
  await clusterPosts();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Saved ${saved} posts in ${duration}s`);
}

module.exports = runAllScrapers;