const Post = require('../models/Post');

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const THRESHOLD = 0.85;

async function clusterPosts() {
  const posts = await Post.find({ 
    embedding: { $exists: true, $ne: [] } 
  }).lean();
  
  const visited = new Set();
  let count = 0;
  
  for (let i = 0; i < posts.length; i++) {
    const id = posts[i]._id.toString();
    if (visited.has(id)) continue;
    
    const clusterId = `cluster_${count++}`;
    const members = [posts[i]._id];
    visited.add(id);
    
    for (let j = i + 1; j < posts.length; j++) {
      const idJ = posts[j]._id.toString();
      if (visited.has(idJ)) continue;
      
      const sim = cosineSimilarity(posts[i].embedding, posts[j].embedding);
      if (sim >= THRESHOLD) {
        members.push(posts[j]._id);
        visited.add(idJ);
      }
    }
    
    await Post.updateMany(
      { _id: { $in: members } },
      { $set: { clusterId } }
    );
  }
  
  console.log(`🔗 Created ${count} clusters`);
}

module.exports = { clusterPosts, cosineSimilarity };