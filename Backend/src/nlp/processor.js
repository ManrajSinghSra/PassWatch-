const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CATEGORIES = [
  'Application', 'Renewal', 'Appointments', 'Tatkal',
  'Visa', 'Travel Issues', 'Government Announcements',
  'Scams/Fraud', 'News', 'Personal Experiences'
];

async function processBatch(posts) {
  const BATCH_SIZE = 10;
  const results = [];
  
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const processed = await processGroup(batch);
    results.push(...processed);
  }
  
  return results;
}

async function processGroup(batch) {
  const postsText = batch.map((p, idx) => 
    `[${idx}] Title: ${p.title}\nContent: ${(p.content || '').slice(0, 500)}`
  ).join('\n\n---\n\n');
  
  const prompt = `Analyze each post. Return JSON: { "results": [...] } where each item has:
- index (number from brackets)
- isGibberish (true if spam/bot/nonsense)
- category (one of: ${CATEGORIES.join(', ')})
- summary (under 30 words)
- sentiment ("positive", "neutral", or "negative")

Posts:
${postsText}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });
    
    const parsed = JSON.parse(res.choices[0].message.content);
    const analyses = parsed.results || [];
    
    // Get embeddings
    const embeddings = await Promise.all(
      batch.map(p => getEmbedding(`${p.title} ${p.content || ''}`.slice(0, 1000)))
    );
    
    return batch.map((post, idx) => {
      const analysis = analyses[idx] || {};
      return {
        ...post,
        isGibberish: analysis.isGibberish || false,
        category: analysis.category || 'News',
        summary: analysis.summary || post.title?.slice(0, 100) || '',
        sentiment: analysis.sentiment || 'neutral',
        embedding: embeddings[idx]
      };
    });
  } catch (err) {
    console.error('NLP error:', err.message);
    return batch.map(p => ({
      ...p,
      isGibberish: false,
      category: 'News',
      summary: p.title?.slice(0, 100) || '',
      sentiment: 'neutral',
      embedding: []
    }));
  }
}

async function getEmbedding(text) {
  try {
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000)
    });
    return res.data[0].embedding;
  } catch (err) {
    return [];
  }
}

module.exports = { processBatch, getEmbedding };