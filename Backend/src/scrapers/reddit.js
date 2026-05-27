const axios = require('axios');

const SUBREDDITS = [
  'Passports', 'IndianPassport', 'travel', 'IndiansAbroad',
  'visas', 'immigration', 'USCIS', 'ukvisa'
];

const KEYWORDS = ['passport', 'visa', 'pcc', 'tatkal', 'appointment', 
                  'renewal', 'embassy', 'consulate', 'stamping'];

async function scrapeReddit() {
  const posts = [];
  const seenIds = new Set();
  
  for (const sub of SUBREDDITS) {
    try {
      const url = `https://www.reddit.com/r/${sub}/new.json?limit=100`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZebvoScraper/1.0)' },
        timeout: 10000
      });
      
      const items = response.data?.data?.children || [];
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      for (const item of items) {
        const post = item.data;
        if (seenIds.has(post.id)) continue;
        
        const postTime = post.created_utc * 1000;
        if (postTime < dayAgo) continue;
        
        // Filter for keywords if not a passport-focused sub
        const passportSubs = ['Passports', 'IndianPassport', 'visas', 'USCIS', 'ukvisa'];
        const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
        const isRelevant = KEYWORDS.some(kw => text.includes(kw));
        
        if (!passportSubs.includes(sub) && !isRelevant) continue;
        
        seenIds.add(post.id);
        
        posts.push({
          platform: 'reddit',
          platformId: `reddit_${post.id}`,
          author: post.author || 'unknown',
          title: post.title || '',
          content: post.selftext || post.title || '',
          url: `https://reddit.com${post.permalink}`,
          publishedAt: new Date(postTime),
          engagement: {
            likes: post.ups || 0,
            comments: post.num_comments || 0,
            shares: 0
          },
          region: 'Global'
        });
      }
      
      await new Promise(r => setTimeout(r, 1500));
      
    } catch (err) {
      console.error(`Reddit error (${sub}):`, err.message);
    }
  }
  
  console.log(` Reddit: ${posts.length} posts`);
  return posts;
}

module.exports = scrapeReddit;