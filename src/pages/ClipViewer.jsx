import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CLIPS, MOCK_FRIENDS } from '../js/services/clips-data.js';

const VIEWER_HEIGHT = 'min(80dvh, 800px)';

export default function ClipViewer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [currentIdx, setCurrentIdx] = useState(() => {
        const idx = MOCK_CLIPS.findIndex(c => c.id === id);
        return idx >= 0 ? idx : 0;
    });
    const [activePanel, setActivePanel] = useState(null);
    const [saved, setSaved] = useState(new Set());
    const [shareOpen, setShareOpen] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const clip = MOCK_CLIPS[currentIdx];

    useEffect(() => {
        navigate(`/clips/${clip.id}`, { replace: true });
    }, [currentIdx, clip.id]);

    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'ArrowDown') goTo(currentIdx + 1);
            if (e.key === 'ArrowUp')   goTo(currentIdx - 1);
            if (e.key === 'Escape') {
                if (shareOpen) setShareOpen(false);
                else setActivePanel(null);
            }
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentIdx, shareOpen]);

    function goTo(idx) {
        const next = ((idx % MOCK_CLIPS.length) + MOCK_CLIPS.length) % MOCK_CLIPS.length;
        setCurrentIdx(next);
        setActivePanel(null);
    }

    function togglePanel(type) {
        setActivePanel(prev => prev === type ? null : type);
    }

    function handleSave() {
        const clipId = clip.id;
        setSaved(prev => {
            const next = new Set(prev);
            if (next.has(clipId)) {
                next.delete(clipId);
            } else {
                next.add(clipId);
                triggerToast();
            }
            return next;
        });
    }

    function triggerToast() {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2500);
    }

    const isSaved = saved.has(clip.id);

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* Back button */}
            <div className="flex-shrink-0 px-8 pt-4">
                <button
                    onClick={() => navigate('/clips')}
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
                    {activePanel === 'comments' && <CommentsPanel clip={clip} />}
                </aside>

                {/* Clip card */}
                <div
                    className={`relative flex-shrink-0 overflow-hidden rounded-[20px] bg-black ${clip.gradientClass}`}
                    style={{ height: VIEWER_HEIGHT, aspectRatio: '9 / 16' }}
                >
                    {/* Caption overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                        <div className="flex flex-wrap gap-1 mb-2">
                            {clip.tags.map(tag => (
                                <span key={tag} className="text-xs text-yellow-400">{tag}</span>
                            ))}
                        </div>
                        <p className="text-white text-sm leading-relaxed line-clamp-2">{clip.caption}</p>
                    </div>

                    {/* Prev / next nav */}
                    <button
                        onClick={() => goTo(currentIdx - 1)}
                        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-white/40 hover:text-white/80 transition-opacity"
                    >
                        <i className="fa-solid fa-chevron-up text-xl" />
                    </button>
                    <button
                        onClick={() => goTo(currentIdx + 1)}
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
                        icon={isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}
                        label="Save"
                        active={isSaved}
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
    const genres = Array.isArray(clip.show.genres)
        ? clip.show.genres.join(' • ')
        : clip.show.genres;

    return (
        <div className="overflow-y-auto flex-1 p-8">
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-2">Source</p>
                <h2 className="font-serif text-2xl font-semibold text-yellow-500 mb-2">{clip.show.name}</h2>
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium px-3 py-1.5 rounded-full">
                    <i className="fa-solid fa-star text-xs" />
                    {clip.show.rating}
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

function CommentsPanel({ clip }) {
    const comments = clip.comments ?? [];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-7 py-6 border-b border-[#2a2a2a]">
                <h2 className="text-xl font-bold text-white">Comments</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-5">
                {comments.length === 0
                    ? <p className="text-sm text-gray-600 italic">No comments yet.</p>
                    : comments.map((c, i) => <Comment key={i} comment={c} />)
                }
            </div>
            <div className="flex-shrink-0 px-7 pb-6 pt-4 border-t border-[#2a2a2a]">
                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                        ME
                    </div>
                    <div className="flex-1">
                        <textarea
                            placeholder="Add a comment..."
                            className="w-full bg-[#1a1a1a] border border-[#333] focus:border-yellow-500 rounded-lg text-white text-sm px-3 py-2.5 resize-none outline-none transition-colors"
                            style={{ height: '70px' }}
                        />
                        <div className="flex justify-end mt-2">
                            <button className="bg-yellow-500 text-black text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-yellow-400 transition-colors">
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Comment({ comment, reply = false }) {
    return (
        <div className={`flex gap-2.5 ${reply ? 'ml-10 mt-2.5' : 'mb-4'}`}>
            <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs font-semibold text-gray-400 flex-shrink-0 mt-0.5">
                {comment.initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-300 mb-0.5">{comment.user}</p>
                <p className="text-sm text-gray-400 leading-snug">{comment.text}</p>
                {comment.replyCount > 0 && (
                    <button className="text-xs text-gray-600 hover:text-gray-400 mt-1.5 transition-colors">
                        ∨ {comment.replyCount} {comment.replyCount === 1 ? 'Reply' : 'Replies'}
                    </button>
                )}
                {(comment.replies ?? []).map((r, i) => (
                    <Comment key={i} comment={r} reply />
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
