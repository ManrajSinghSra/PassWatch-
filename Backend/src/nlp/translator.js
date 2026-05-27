const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANGUAGES = {
  en: 'English', hi: 'Hindi', pa: 'Punjabi',
  es: 'Spanish', fr: 'French', de: 'German',
  ar: 'Arabic', zh: 'Chinese', ru: 'Russian', ja: 'Japanese'
};

async function translateText(text, targetLang) {
  const langName = LANGUAGES[targetLang] || 'English';
  
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Translate to ${langName}. Return ONLY translation, no explanation.\n\nText: ${text}`
    }],
    temperature: 0.3
  });
  
  return res.choices[0].message.content.trim();
}

module.exports = { translateText, LANGUAGES };