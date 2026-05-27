import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Globe, ExternalLink, Filter, X, BarChart3 } from 'lucide-react';

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

const PLATFORMS = ['reddit', 'hackernews', 'news'];
const SENTIMENTS = ['positive', 'neutral', 'negative'];

const PLATFORM_COLORS = {
  reddit: 'bg-orange-100 text-orange-700 border-orange-200',
  hackernews: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  news: 'bg-blue-100 text-blue-700 border-blue-200'
};

const SENTIMENT_COLORS = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700'
};

export default function App() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ platform: '', category: '', sentiment: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [translateModal, setTranslateModal] = useState(null);

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

  function handleExport() {
    window.open(`${API.defaults.baseURL}/export/csv`, '_blank');
  }

  function clearFilters() {
    setFilters({ platform: '', category: '', sentiment: '', search: '' });
  }

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🛂 Zebvo Newswire</h1>
              <p className="text-sm text-gray-600">Passport-related social media intelligence • Last 24 hours</p>
            </div>
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <Download size={16} /> Export CSV
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter chips + toggle */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-sm">
              <Filter size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-600 hover:underline">
                Clear all
              </button>
            )}
            {stats && (
              <span className="ml-auto text-sm text-gray-600">
                <BarChart3 size={14} className="inline mr-1" />
                {stats.total} posts
              </span>
            )}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <select value={filters.platform} onChange={e => setFilters({ ...filters, platform: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Platforms</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filters.sentiment} onChange={e => setFilters({ ...filters, sentiment: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">All Sentiments</option>
                {SENTIMENTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats overview */}
        {stats && stats.platforms && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Posts" value={stats.total} color="bg-blue-50 text-blue-700" />
            {stats.platforms.map(p => (
              <StatCard key={p._id} label={p._id} value={p.count} color="bg-gray-50 text-gray-700" />
            ))}
          </div>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No posts found. {activeFilterCount > 0 && 'Try clearing filters.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard key={post._id} post={post} onTranslate={() => setTranslateModal(post)} />
            ))}
          </div>
        )}
      </main>

      {/* Translation Modal */}
      {translateModal && (
        <TranslateModal post={translateModal} onClose={() => setTranslateModal(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`${color} rounded-lg p-3`}>
      <div className="text-xs uppercase opacity-75">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function PostCard({ post, onTranslate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-4 border border-gray-100">
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className={`text-xs px-2 py-1 rounded border ${PLATFORM_COLORS[post.platform] || 'bg-gray-100'}`}>
          {post.platform}
        </span>
        <div className="flex gap-1 flex-wrap">
          {post.category && (
            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded">{post.category}</span>
          )}
          {post.sentiment && (
            <span className={`text-xs px-2 py-1 rounded ${SENTIMENT_COLORS[post.sentiment]}`}>
              {post.sentiment}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.summary || post.content?.slice(0, 200)}</p>

      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
        <span>👤 {post.author}</span>
        <span>{new Date(post.publishedAt).toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        {post.engagement?.likes > 0 && <span>⬆️ {post.engagement.likes}</span>}
        {post.engagement?.comments > 0 && <span>💬 {post.engagement.comments}</span>}
      </div>

      <div className="flex gap-2">
        <button onClick={onTranslate}
          className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100">
          <Globe size={12} /> Translate
        </button>
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-100 px-3 py-2 rounded hover:bg-gray-200">
          <ExternalLink size={12} /> Open
        </a>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Translate Post</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 mb-4 italic">"{post.title}"</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => translate(l.code)}
                className={`text-xs px-2 py-2 rounded ${selectedLang === l.code ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                {l.name}
              </button>
            ))}
          </div>
          {loading && <div className="text-center text-gray-500">Translating...</div>}
          {translation && !loading && (
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-xs text-blue-700 mb-1">{LANGUAGES.find(l => l.code === selectedLang)?.name}</div>
              <p className="text-gray-900">{translation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}