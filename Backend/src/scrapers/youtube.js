const { google } = require('googleapis');
const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

async function scrapeYouTube() {
  const posts = [];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  try {
    const res = await youtube.search.list({
      part: 'snippet', q: 'passport', type: 'video',
      maxResults: 50, publishedAfter: yesterday, order: 'date'
    });
    
    const videoIds = res.data.items.map(v => v.id.videoId).join(',');
    const stats = await youtube.videos.list({ part: 'statistics', id: videoIds });
    const statsMap = {};
    stats.data.items.forEach(v => statsMap[v.id] = v.statistics);
    
    for (const v of res.data.items) {
      const s = statsMap[v.id.videoId] || {};
      posts.push({
        platform: 'youtube',
        platformId: `yt_${v.id.videoId}`,
        author: v.snippet.channelTitle,
        title: v.snippet.title,
        content: v.snippet.description,
        url: `https://youtube.com/watch?v=${v.id.videoId}`,
        publishedAt: new Date(v.snippet.publishedAt),
        engagement: {
          likes: parseInt(s.likeCount) || 0,
          comments: parseInt(s.commentCount) || 0,
          shares: parseInt(s.viewCount) || 0
        },
        region: 'Global'
      });
    }
  } catch (err) {
    console.error('YouTube error:', err.message);
  }
  
  console.log(` YouTube: ${posts.length} posts`);
  return posts;
}

module.exports = scrapeYouTube;