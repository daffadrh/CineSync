import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getClips } from '../services/clips-service.js';
import { extractYoutubeVideoId } from '../utils/youtube.js';
import ShareClipModal from '../components/ShareClipModal.jsx';

const TABS = [
    { key: 'all', label: 'Community' },
    { key: 'trending', label: 'Trending' },
    { key: 'watchlist', label: 'From Watchlist' },
    { key: 'saved', label: 'Saved' },
];

export default function Clips() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') ?? 'all';

    const [clips, setClips] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        if ((filter === 'watchlist' || filter === 'saved') && !currentUser) {
            setError(filter === 'saved'
                ? 'Log in to see your saved clips.'
                : 'Log in to see clips from your watchlist.');
            setClips([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        async function load() {
            const token = currentUser ? await currentUser.getIdToken() : undefined;
            try {
                const data = await getClips(filter, 1, token);
                if (cancelled) return;
                setClips(data.items);
                setPage(1);
                setHasMore(data.hasMore);
            } catch {
                if (!cancelled) setError('Failed to load clips.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [filter, currentUser]);

    async function handleLoadMore() {
        setLoadingMore(true);
        try {
            const token = currentUser ? await currentUser.getIdToken() : undefined;
            const data = await getClips(filter, page + 1, token);
            setClips(prev => [...prev, ...data.items]);
            setPage(prev => prev + 1);
            setHasMore(data.hasMore);
        } finally {
            setLoadingMore(false);
        }
    }

    function handleTabClick(key) {
        setSearchParams(key === 'all' ? {} : { filter: key });
    }

    const visibleTabs = currentUser
        ? TABS
        : TABS.filter(tab => tab.key !== 'watchlist' && tab.key !== 'saved');

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                                Discover moments in short form
                            </p>
                            <h2 className="font-serif text-4xl font-bold">
                                Find what <span className="text-yellow-500 italic">other people</span> are watching.
                            </h2>
                        </div>
                        {currentUser && (
                            <button
                                onClick={() => setShareOpen(true)}
                                className="flex-shrink-0 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
                            >
                                <i className="fa-solid fa-plus" />
                                Share a Clip
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 mb-8">
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabClick(tab.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    filter === tab.key
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading && (
                        <div className="flex justify-center py-20">
                            <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
                        </div>
                    )}

                    {error && (
                        <p className="text-gray-500 text-sm text-center py-20">{error}</p>
                    )}

                    {!loading && !error && clips.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-20">
                            {filter === 'watchlist'
                                ? "No clips yet for shows on your watchlist."
                                : filter === 'saved'
                                    ? "You haven't saved any clips yet."
                                    : "No clips yet. Be the first to share one!"}
                        </p>
                    )}

                    {!loading && !error && clips.length > 0 && (
                        <>
                            <div className="clips-grid">
                                {clips.map(clip => (
                                    <ClipCard
                                        key={clip.id}
                                        clip={clip}
                                        onClick={() => navigate(`/clips/${clip.id}?filter=${filter}`)}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Load More'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {shareOpen && (
                <ShareClipModal
                    onClose={() => setShareOpen(false)}
                    onCreated={clip => setClips(prev => [clip, ...prev])}
                />
            )}
        </div>
    );
}

function ClipCard({ clip, onClick }) {
    const videoId = extractYoutubeVideoId(clip.youtubeUrl);

    return (
        <div
            className={`relative rounded-2xl overflow-hidden cursor-pointer aspect-[9/16] ${videoId ? 'bg-black' : (clip.gradientClass ?? 'bg-[#1a1a1a]')}`}
            onClick={onClick}
        >
            {videoId && (
                <img
                    src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {clip.tags.map(tag => (
                        <span key={tag} className="text-xs text-yellow-400">{tag}</span>
                    ))}
                </div>
                <p className="text-white text-sm leading-snug line-clamp-2">{clip.caption}</p>
                <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                    <i className="fa-regular fa-comment text-[10px]" />
                    <span>{clip.commentCount}</span>
                </div>
            </div>
        </div>
    );
}
