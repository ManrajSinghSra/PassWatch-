import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Globe, ExternalLink, Filter, X, RefreshCw } from 'lucide-react';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' },
  { code: 'pa', name: 'Punjabi' }, { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' }, { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' }, { code: 'ja', name: 'Japanese' }
];

const CATEGORIES = [
  'Application', 'Renewal', 'Appointments', 'Tatkal', 'Visa',
  'Travel Issues', 'Government Announcements', 'Scams/Fraud', 'News', 'Personal Experiences'
];

const PLATFORMS = ['reddit', 'youtube', 'hackernews', 'news'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

const PLATFORM_STYLES = {
  reddit: 'bg-orange-100 text-orange-800 border-orange-300',
  youtube: 'bg-red-100 text-red-800 border-red-300',
  hackernews: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  news: 'bg-blue-100 text-blue-800 border-blue-300'
};

const SENTIMENT_STYLES = {
  positive: 'bg-lime-100 text-lime-900',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-800'
};

export default function App() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ platform: '', category: '', sentiment: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [translateModal, setTranslateModal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [filters]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const res = await API.get('/posts', { params: { ...params, limit: 100 } });
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error(e);
      setPosts([]);
    }
    setLoading(false);
  }

  async function fetchStats() {
    try {
      const res = await API.get('/posts/stats');
      setStats(res.data);
    } catch (e) { console.error(e); }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await API.post('/posts/scrape');
      setTimeout(() => {
        fetchPosts();
        fetchStats();
        setRefreshing(false);
      }, 5000);
    } catch (e) {
      console.error(e);
      setRefreshing(false);
    }
  }

  function clearFilters() {
    setFilters({ platform: '', category: '', sentiment: '', search: '' });
  }

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="min-h-screen bg-white">
      {/* GRID BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          zIndex: 0
        }}
      />

      <div className="relative z-10">
        {/* TOP NAV */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-black tracking-tight">PASSWATCH</div>
              <div className="text-xs bg-lime-400 text-black font-bold px-2 py-1 rounded">LIVE</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} disabled={refreshing}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> 
                {refreshing ? 'Scraping...' : 'Refresh'}
              </button>
              <a href={`${API.defaults.baseURL}/export/csv`} target="_blank" rel="noreferrer"
                className="text-sm font-semibold text-black hover:text-lime-600">
                Export CSV
              </a>
              <a href={`${API.defaults.baseURL}/export/pdf`} target="_blank" rel="noreferrer"
                className="bg-lime-400 hover:bg-lime-500 text-black font-bold px-5 py-2.5 rounded-full text-sm transition">
                Export PDF
              </a>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <span>🏠</span> <span>›</span> <span>Newswire Dashboard</span>
          </div>
          
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-1 bg-lime-400 mt-8"></div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              Passport<br/>Intelligence
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 max-w-2xl ml-20">
            Real-time social media insights, AI-powered categorization, and multilingual analysis 
            from the global passport conversation — last 24 hours.
          </p>
        </section>

        {/* STATS BANNER (Zebvo style) */}
        {stats && (
          <section className="bg-lime-400 py-12 mb-12">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatBlock value={stats.total || 0} label="Posts Tracked" />
              <StatBlock value={(stats.platforms?.length || 0) + '+'} label="Platforms Monitored" />
              <StatBlock value={(stats.categories?.length || 0)} label="Categories Classified" />
              <StatBlock value="10" label="Languages Supported" />
            </div>
          </section>
        )}

        {/* CONTENT SECTION */}
        <main className="max-w-7xl mx-auto px-6 pb-16">
          {/* SECTION HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-bold text-gray-400">01</span>
            <div className="w-12 h-px bg-gray-400"></div>
            <span className="text-sm font-bold text-lime-600 tracking-widest">LIVE FEED</span>
          </div>

          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-4xl md:text-5xl font-black">Latest Posts</h2>
            <div className="text-sm text-gray-600">
              Updated every 30 minutes · {posts.length} posts shown
            </div>
          </div>

          {/* FILTERS */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search across all posts..."
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                className="flex-1 bg-transparent text-lg font-medium focus:outline-none"
              />
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition ${
                  showFilters || activeFilterCount > 0 ? 'bg-black text-white' : 'border border-gray-300 hover:bg-gray-50'
                }`}>
                <Filter size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-bold text-red-600 hover:underline">
                  Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <FilterSelect label="Platform" value={filters.platform} options={PLATFORMS}
                  onChange={v => setFilters({ ...filters, platform: v })} />
                <FilterSelect label="Category" value={filters.category} options={CATEGORIES}
                  onChange={v => setFilters({ ...filters, category: v })} />
                <FilterSelect label="Sentiment" value={filters.sentiment} options={SENTIMENTS}
                  onChange={v => setFilters({ ...filters, sentiment: v })} />
              </div>
            )}
          </div>

          {/* POSTS GRID */}
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-medium">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-2xl font-bold mb-2">No posts found</div>
              <div className="text-gray-500">
                {activeFilterCount > 0 ? 'Try clearing filters' : 'Check back soon'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map(post => (
                <PostCard key={post._id} post={post} onTranslate={() => setTranslateModal(post)} />
              ))}
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-black text-white py-12 mt-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="text-3xl font-black mb-2">PASSWATCH</div>
                <div className="text-gray-400 text-sm">Built for the Zebvo Newswire assessment · 2026</div>
              </div>
              <div className="text-sm text-gray-400">
                Reddit · YouTube · HackerNews · Google News
              </div>
            </div>
          </div>
        </footer>
      </div>

      {translateModal && (
        <TranslateModal post={translateModal} onClose={() => setTranslateModal(null)} />
      )}
    </div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div>
      <div className="text-5xl md:text-6xl font-black text-black leading-none">{value}</div>
      <div className="text-sm font-semibold text-black/70 mt-2">{label}</div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-gray-500 block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-black">
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PostCard({ post, onTranslate }) {
  return (
    <div className="bg-white border-2 border-gray-200 hover:border-black rounded-2xl p-5 transition group">
      <div className="flex justify-between items-start gap-2 mb-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${PLATFORM_STYLES[post.platform] || 'bg-gray-100 text-gray-700'}`}>
          {post.platform}
        </span>
        <div className="flex gap-1 flex-wrap">
          {post.sentiment && (
            <span className={`text-xs font-bold px-2 py-1 rounded ${SENTIMENT_STYLES[post.sentiment]}`}>
              {post.sentiment}
            </span>
          )}
        </div>
      </div>

      {post.category && (
        <div className="text-xs font-bold text-lime-700 mb-2 tracking-wider uppercase">
          {post.category}
        </div>
      )}

      <h3 className="font-black text-lg text-black mb-2 line-clamp-2 leading-tight group-hover:text-lime-700 transition">
        {post.title}
      </h3>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
        {post.summary || post.content?.slice(0, 200)}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
        <span className="font-semibold">@{post.author}</span>
        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
          {post.engagement?.likes > 0 && <span>↑ {post.engagement.likes}</span>}
          {post.engagement?.comments > 0 && <span>💬 {post.engagement.comments}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={onTranslate}
            className="text-xs font-bold bg-black hover:bg-lime-500 hover:text-black text-white px-3 py-2 rounded-full transition">
            <Globe size={12} className="inline mr-1" /> Translate
          </button>
          <a href={post.url} target="_blank" rel="noopener noreferrer"
            className="text-xs font-bold border-2 border-black hover:bg-black hover:text-white text-black px-3 py-2 rounded-full transition">
            <ExternalLink size={12} className="inline mr-1" /> Open
          </a>
        </div>
      </div>
    </div>
  );
}

function TranslateModal({ post, onClose }) {
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);

  async function translate(langCode) {
    setLoading(true);
    setSelectedLang(langCode);
    try {
      const res = await API.post('/posts/translate', { postId: post._id, targetLang: langCode });
      setTranslation(res.data.translation);
    } catch (e) {
      setTranslation('Translation failed.');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <div className="text-xs font-bold text-lime-600 tracking-widest uppercase mb-1">Translation</div>
            <h3 className="text-2xl font-black">Pick a language</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-5 italic border-l-4 border-lime-400 pl-4">
            "{post.title}"
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => translate(l.code)}
                className={`text-xs font-bold px-3 py-2.5 rounded-full transition ${
                  selectedLang === l.code 
                    ? 'bg-lime-400 text-black' 
                    : 'bg-gray-100 hover:bg-gray-200 text-black'
                }`}>
                {l.name}
              </button>
            ))}
          </div>
          {loading && <div className="text-center text-gray-500 font-semibold py-6">Translating...</div>}
          {translation && !loading && (
            <div className="bg-lime-50 border-2 border-lime-400 p-5 rounded-2xl">
              <div className="text-xs font-bold text-lime-700 tracking-widest uppercase mb-2">
                {LANGUAGES.find(l => l.code === selectedLang)?.name}
              </div>
              <p className="text-black font-medium leading-relaxed">{translation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}