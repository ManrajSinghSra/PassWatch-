const axios = require('axios');

async function scrapeHackerNews() {
  const posts = [];
  const queries = ['passport', 'visa india', 'travel document'];
  const dayAgoSec = Math.floor(Date.now() / 1000) - 86400;
  
  for (const query of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&hitsPerPage=50&numericFilters=created_at_i>${dayAgoSec}`;
      
      const response = await axios.get(url, { timeout: 10000 });
      const items = response.data?.hits || [];
      
      for (const item of items) {
        if (posts.find(p => p.platformId === `hn_${item.objectID}`)) continue;
        
        posts.push({
          platform: 'hackernews',
          platformId: `hn_${item.objectID}`,
          author: item.author || 'unknown',
          title: item.title || item.story_title || '',
          content: item.story_text || item.comment_text || item.title || '',
          url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
          publishedAt: new Date(item.created_at),
          engagement: {
            likes: item.points || 0,
            comments: item.num_comments || 0,
            shares: 0
          },
          region: 'Global'
        });
      }
    } catch (err) {
      console.error(`HN error (${query}):`, err.message);
    }
  }
  
  console.log(`✅ HackerNews: ${posts.length} posts`);
  return posts;
}

module.exports = scrapeHackerNews;