const RSSParser = require('rss-parser');
const parser = new RSSParser({ timeout: 10000 });

const FEEDS = [
  // English news
  'https://news.google.com/rss/search?q=passport+india&hl=en-IN&gl=IN',
  'https://news.google.com/rss/search?q=passport+renewal&hl=en',
  'https://news.google.com/rss/search?q=visa+stamping&hl=en',
  'https://news.google.com/rss/search?q=tatkal+passport&hl=en',
  'https://news.google.com/rss/search?q=passport+appointment&hl=en',
  
  // More keywords
  'https://news.google.com/rss/search?q=passport+seva&hl=en',
  'https://news.google.com/rss/search?q=visa+rejection&hl=en',
  'https://news.google.com/rss/search?q=embassy+passport&hl=en',
  'https://news.google.com/rss/search?q=passport+fraud&hl=en',
  'https://news.google.com/rss/search?q=visa+interview&hl=en',
  
  // Global
  'https://news.google.com/rss/search?q=immigration+visa&hl=en',
  'https://news.google.com/rss/search?q=international+travel+passport&hl=en'
];

async function scrapeNews() {
  const posts = [];
  const seenLinks = new Set();
  
  for (const feedUrl of FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (const item of feed.items.slice(0, 30)) {
        if (seenLinks.has(item.link)) continue;
        seenLinks.add(item.link);
        
        const pubDate = new Date(item.pubDate || item.isoDate);
        if (pubDate < dayAgo) continue;
        
        const sourceName = item.creator || feed.title || 'News';
        
        posts.push({
          platform: 'news',
          platformId: `news_${Buffer.from(item.link).toString('base64').slice(0, 30)}`,
          author: sourceName,
          title: item.title || '',
          content: item.contentSnippet || item.content || item.title || '',
          url: item.link,
          publishedAt: pubDate,
          engagement: { likes: 0, comments: 0, shares: 0 },
          region: 'Global'
        });
      }
    } catch (err) {
      console.error('News RSS error:', err.message);
    }
  }
  
  console.log(`✅ News: ${posts.length} posts`);
  return posts;
}

module.exports = scrapeNews;