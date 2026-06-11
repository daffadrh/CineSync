import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWatchlist } from '../context/WatchlistContext.jsx';
import { getClips, getClip, toggleSave, postComment } from '../services/clips-service.js';
import { getMovieDetails } from '../services/tmdb-api.js';
import { extractYoutubeVideoId, loadYouTubeIframeApi } from '../utils/youtube.js';
import { MOCK_FRIENDS } from '../js/services/clips-data.js';

const VIEWER_HEIGHT = 'min(80dvh, 800px)';

export default function ClipViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') ?? 'all';

    const [clipList, setClipList] = useState([]);
    const [clip, setClip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [muted, setMuted] = useState(true);
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    // Reset to muted whenever the clip changes (autoplay policies require muted start)
    useEffect(() => {
        setMuted(true);
    }, [id]);

    // Prev/next list for the active filter (first page only)
    useEffect(() => {
        let cancelled = false;
        async function load() {
            const token = currentUser ? await currentUser.getIdToken() : undefined;
            const data = await getClips(filter, 1, token).catch(() => ({ items: [] }));
            if (!cancelled) setClipList(data.items ?? []);
        }
        load();
        return () => { cancelled = true; };
    }, [filter, currentUser]);

    // The current clip
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setActivePanel(null);

        async function load() {
            const token = currentUser ? await currentUser.getIdToken() : undefined;
            try {
                const data = await getClip(id, token);
                if (!cancelled) setClip(data);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [id, currentUser]);

    const currentIdx = clipList.findIndex(c => c.id === id);

    function goTo(offset) {
        if (clipList.length === 0) return;
        const base = currentIdx >= 0 ? currentIdx : 0;
        const next = ((base + offset) % clipList.length + clipList.length) % clipList.length;
        navigate(`/clips/${clipList[next].id}?filter=${filter}`, { replace: true });
    }

    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'ArrowDown') goTo(1);
            if (e.key === 'ArrowUp')   goTo(-1);
            if (e.key === 'Escape') {
                if (shareOpen) setShareOpen(false);
                else setActivePanel(null);
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentIdx, clipList, shareOpen, filter]);

    function togglePanel(type) {
        setActivePanel(prev => prev === type ? null : type);
    }

    async function handleSave() {
        if (!clip || saving) return;
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setSaving(true);
        try {
            const token = await currentUser.getIdToken();
            const result = await toggleSave(token, clip.id);
            setClip(prev => ({ ...prev, saved: result.saved, saveCount: result.saveCount }));
            if (result.saved) triggerToast();
        } finally {
            setSaving(false);
        }
    }

    function toggleMute() {
        const player = playerRef.current;
        if (!player) return;
        const next = !muted;
        if (next) {
            player.mute();
        } else {
            player.unMute();
            player.setVolume(100);
        }
        setMuted(next);
    }

    function triggerToast() {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    }

    async function handlePostComment(text) {
        const token = await currentUser.getIdToken();
        const comment = await postComment(token, clip.id, { text });
        setClip(prev => ({
            ...prev,
            comments: [...(prev.comments ?? []), { ...comment, replies: [] }],
            commentCount: (prev.commentCount ?? 0) + 1,
        }));
    }

    const videoId = clip ? extractYoutubeVideoId(clip.youtubeUrl) : null;

    // Mount a YouTube IFrame Player for the active clip (gives us a real
    // player handle so the mute toggle can call unMute()/setVolume()).
    useEffect(() => {
        if (!videoId || !playerContainerRef.current) return;

        let cancelled = false;
        let player;

        loadYouTubeIframeApi().then(YT => {
            if (cancelled || !playerContainerRef.current) return;
            player = new YT.Player(playerContainerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    playlist: videoId,
                    controls: 0,
                    playsinline: 1,
                },
                events: {
                    onReady: e => {
                        playerRef.current = e.target;
                        e.target.mute();
                        e.target.playVideo();
                    },
                },
            });
        });

        return () => {
            cancelled = true;
            playerRef.current = null;
            player?.destroy?.();
        };
    }, [clip?.id, videoId]);

    if (loading || !clip) {
        return (
            <div className="flex items-center justify-center h-full">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Back button */}
            <div className="flex-shrink-0 px-8 pt-4">
                <button
                    onClick={() => navigate(`/clips${filter !== 'all' ? `?filter=${filter}` : ''}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
                >
                    <i className="fa-solid fa-arrow-left text-xs" />
                    Back to Clips
                </button>
            </div>

            {/* Viewer */}
            <div className="flex-1 flex items-center justify-center overflow-hidden px-8 pb-6">
            <div className="flex items-center gap-3">

                {/* Side panel */}
                <aside
                    className="hide-scrollbar flex-shrink-0 bg-[#141414] rounded-[20px] flex flex-col overflow-hidden"
                    style={{
                        width: activePanel ? '300px' : '0',
                        opacity: activePanel ? 1 : 0,
                        height: VIEWER_HEIGHT,
                        transition: 'width 0.3s ease, opacity 0.3s ease',
                    }}
                >
                    {activePanel === 'info'     && <InfoPanel clip={clip} />}
                    {activePanel === 'comments' && (
                        <CommentsPanel clip={clip} currentUser={currentUser} onPost={handlePostComment} />
                    )}
                </aside>

                {/* Clip card */}
                <div
                    className="relative flex-shrink-0 overflow-hidden rounded-[20px] bg-black"
                    style={{ height: VIEWER_HEIGHT, aspectRatio: '9 / 16' }}
                >
                    {videoId ? (
                        <div
                            key={clip.id}
                            ref={playerContainerRef}
                            className="absolute inset-0 w-full h-full [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:w-full [&>iframe]:h-full"
                        />
                    ) : (
                        <div className={`absolute inset-0 ${clip.gradientClass ?? ''}`} />
                    )}

                    {videoId && (
                        <button
                            onClick={toggleMute}
                            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                        >
                            <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
                        </button>
                    )}

                    {/* Caption overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                        <div className="flex flex-wrap gap-1 mb-2">
                            {clip.tags.map(tag => (
                                <span key={tag} className="text-xs text-yellow-400">{tag}</span>
                            ))}
                        </div>
                        <p className="text-white text-sm leading-relaxed line-clamp-2">{clip.caption}</p>
                    </div>

                    {/* Prev / next nav */}
                    <button
                        onClick={() => goTo(-1)}
                        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-white/40 hover:text-white/80 transition-opacity"
                    >
                        <i className="fa-solid fa-chevron-up text-xl" />
                    </button>
                    <button
                        onClick={() => goTo(1)}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-white/40 hover:text-white/80 transition-opacity"
                    >
                        <i className="fa-solid fa-chevron-down text-xl" />
                    </button>
                </div>

                {/* Action rail */}
                <div
                    className="flex flex-col justify-center gap-0.5 flex-shrink-0 bg-[#0d0d0d] rounded-[20px] px-3"
                    style={{ height: VIEWER_HEIGHT }}
                >
                    <ActionBtn
                        icon="fa-solid fa-circle-info"
                        label="Info"
                        active={activePanel === 'info'}
                        onClick={() => togglePanel('info')}
                    />
                    <ActionBtn
                        icon="fa-regular fa-comment"
                        label={String(clip.commentCount ?? 0)}
                        active={activePanel === 'comments'}
                        onClick={() => togglePanel('comments')}
                    />
                    <ActionBtn
                        icon="fa-solid fa-share-nodes"
                        label="Share"
                        active={false}
                        onClick={() => setShareOpen(true)}
                    />
                    <ActionBtn
                        icon={clip.saved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}
                        label="Save"
                        active={clip.saved}
                        onClick={handleSave}
                    />
                </div>
            </div>
            </div>

            {shareOpen && <ShareOverlay clip={clip} onClose={() => setShareOpen(false)} />}

            {/* Saved toast */}
            <div
                className="fixed bottom-10 left-1/2 bg-[#141414] border border-[#2a2a2a] rounded-xl px-10 py-4 z-[80] pointer-events-none"
                style={{
                    opacity: toastVisible ? 1 : 0,
                    transform: `translateX(-50%) translateY(${toastVisible ? '0px' : '16px'})`,
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                }}
            >
                <p className="font-serif text-xl italic font-semibold text-yellow-500 whitespace-nowrap">Clip Saved!</p>
            </div>
        </div>
    );
}

function ActionBtn({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-3xl hover:bg-white/5 transition-colors"
        >
            <span
                className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-lg"
                style={{
                    background:   active ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.07)',
                    border:       `1px solid ${active ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    color:        active ? '#eab308' : 'white',
                    transition:   'background 0.2s, border-color 0.2s, color 0.2s',
                }}
            >
                <i className={icon} />
            </span>
            <span className="text-[11px] font-medium text-gray-400">{label}</span>
        </button>
    );
}

function InfoPanel({ clip }) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { watchlistMap, add } = useWatchlist();
    const [adding, setAdding] = useState(false);

    const genres = Array.isArray(clip.show.genres)
        ? clip.show.genres.join(' • ')
        : clip.show.genres;

    const inWatchlist = watchlistMap.has(clip.show.tmdbId);

    async function handleAddToWatchlist() {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setAdding(true);
        try {
            const movie = await getMovieDetails(clip.show.tmdbId);
            await add(movie);
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="overflow-y-auto flex-1 p-8">
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-2">Source</p>
                <h2 className="font-serif text-2xl font-semibold text-yellow-500 mb-2">{clip.show.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium px-3 py-1.5 rounded-full">
                        <i className="fa-solid fa-star text-xs" />
                        {clip.show.rating}
                    </div>
                    <button
                        onClick={handleAddToWatchlist}
                        disabled={inWatchlist || adding}
                        className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                            inWatchlist
                                ? 'bg-[#1f1f1f] border border-[#2a2a2a] text-gray-400 cursor-default'
                                : 'bg-[#1f1f1f] border border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#252525] disabled:opacity-70'
                        }`}
                    >
                        <i className={`fa-solid ${adding ? 'fa-circle-notch fa-spin' : inWatchlist ? 'fa-check' : 'fa-plus'}`} />
                        {inWatchlist ? 'In Watchlist' : adding ? 'Adding…' : 'Add to Watchlist'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">{genres}</p>
            </div>

            <div className="h-px bg-[#2a2a2a] mb-6" />

            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">About</p>
                <p className="text-sm text-gray-400 leading-relaxed">{clip.show.description}</p>
            </div>

            <div className="h-px bg-[#2a2a2a] mb-6" />

            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">Clip</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {(clip.tags ?? []).map(tag => (
                        <span key={tag} className="text-xs text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{clip.caption}</p>
            </div>

            <div className="h-px bg-[#2a2a2a] mb-6" />

            <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">External Links</p>
                <a
                    href={clip.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                    View original clip
                </a>
            </div>
        </div>
    );
}

function CommentsPanel({ clip, currentUser, onPost }) {
    const comments = clip.comments ?? [];
    const [text, setText] = useState('');
    const [posting, setPosting] = useState(false);

    async function handlePost() {
        if (!text.trim() || posting) return;
        setPosting(true);
        try {
            await onPost(text.trim());
            setText('');
        } finally {
            setPosting(false);
        }
    }

    const initials = (currentUser?.displayName ?? currentUser?.email ?? '?')[0].toUpperCase();

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-7 py-6 border-b border-[#2a2a2a]">
                <h2 className="text-xl font-bold text-white">Comments</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-5">
                {comments.length === 0
                    ? <p className="text-sm text-gray-600 italic">No comments yet.</p>
                    : comments.map(c => <Comment key={c.id} comment={c} />)
                }
            </div>
            <div className="flex-shrink-0 px-7 pb-6 pt-4 border-t border-[#2a2a2a]">
                {currentUser ? (
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full bg-[#1a1a1a] border border-[#333] focus:border-yellow-500 rounded-lg text-white text-sm px-3 py-2.5 resize-none outline-none transition-colors"
                                style={{ height: '70px' }}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handlePost}
                                    disabled={posting || !text.trim()}
                                    className="bg-yellow-500 text-black text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                >
                                    {posting ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-gray-600 text-center">Log in to leave a comment.</p>
                )}
            </div>
        </div>
    );
}

function Comment({ comment, reply = false }) {
    const replies = comment.replies ?? [];

    return (
        <div className={`flex gap-2.5 ${reply ? 'ml-10 mt-2.5' : 'mb-4'}`}>
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-semibold text-gray-400 flex-shrink-0 mt-0.5">
                {comment.authorInitials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-300 mb-0.5">{comment.authorName}</p>
                <p className="text-sm text-gray-400 leading-snug">{comment.text}</p>
                {replies.map(r => (
                    <Comment key={r.id} comment={r} reply />
                ))}
            </div>
        </div>
    );
}

const PLATFORMS = [
    { label: 'X/Twitter', icon: 'fa-brands fa-twitter',      bg: 'bg-black border border-[#333]' },
    { label: 'Facebook',  icon: 'fa-brands fa-facebook-f',    bg: 'bg-[#1877f2]'                 },
    { label: 'Whatsapp',  icon: 'fa-brands fa-whatsapp',      bg: 'bg-[#25d366]'                 },
    { label: 'Mail',      icon: 'fa-solid fa-envelope',       bg: 'bg-gray-500'                  },
    { label: 'Reddit',    icon: 'fa-brands fa-reddit-alien',  bg: 'bg-[#ff4500]'                 },
];

function ShareOverlay({ clip, onClose }) {
    const [copied, setCopied] = useState(false);
    const url = `https://cinesync.com/clips/${clip.id}`;

    function handleCopy() {
        navigator.clipboard?.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-[18px] p-7 max-w-[90vw] w-[560px] shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-2xl font-semibold italic text-yellow-500">Share</span>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <i className="fa-solid fa-xmark text-white" />
                    </button>
                </div>

                {/* Friends row */}
                <div className="flex items-center gap-2 mb-6">
                    <button className="w-8 h-8 rounded-full bg-white/5 border border-[#333] text-gray-400 hover:text-white flex items-center justify-center text-xs flex-shrink-0">
                        <i className="fa-solid fa-chevron-left" />
                    </button>
                    <div className="flex-1 flex justify-center gap-6">
                        {MOCK_FRIENDS.map(friend => (
                            <button key={friend.uid} className="flex flex-col items-center gap-1.5">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold hover:opacity-80 transition-opacity"
                                    style={{ background: friend.color }}
                                >
                                    {friend.initial}
                                </div>
                                <span className="text-[11px] text-gray-400">{friend.displayName.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 border border-[#333] text-gray-400 hover:text-white flex items-center justify-center text-xs flex-shrink-0">
                        <i className="fa-solid fa-chevron-right" />
                    </button>
                </div>

                <div className="h-px bg-[#2a2a2a] mb-5" />

                {/* Platforms row */}
                <div className="flex items-center gap-2 mb-6">
                    <button className="w-8 h-8 rounded-full bg-white/5 border border-[#333] text-gray-400 hover:text-white flex items-center justify-center text-xs flex-shrink-0">
                        <i className="fa-solid fa-chevron-left" />
                    </button>
                    <div className="flex-1 flex justify-center gap-6">
                        {PLATFORMS.map(p => (
                            <button key={p.label} className="flex flex-col items-center gap-1.5">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl hover:opacity-80 transition-opacity ${p.bg}`}>
                                    <i className={p.icon} />
                                </div>
                                <span className="text-[11px] text-gray-400">{p.label}</span>
                            </button>
                        ))}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 border border-[#333] text-gray-400 hover:text-white flex items-center justify-center text-xs flex-shrink-0">
                        <i className="fa-solid fa-chevron-right" />
                    </button>
                </div>

                {/* Copy link */}
                <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#333] rounded-xl px-3.5 py-2.5">
                    <span className="flex-1 text-xs text-gray-500 truncate">{url}</span>
                    <button
                        onClick={handleCopy}
                        className={`text-xs font-semibold px-2 py-1 rounded-md hover:bg-white/5 whitespace-nowrap transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

            </div>
        </div>
    );
}
