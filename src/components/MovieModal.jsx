import { useState, useEffect } from 'react';
import { getMovieDetails, IMG_BASE_URL } from '../services/tmdb-api.js';
import { useWatchlist, STATUSES, STATUS_LABELS } from '../context/WatchlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getFriends } from '../services/profile-service.js';
import { sendRecommendation } from '../services/recommendations-service.js';

const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

export default function MovieModal({ movie, onClose }) {
    const { watchlistMap, add, changeStatus, remove } = useWatchlist();
    const [details, setDetails] = useState(null);
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const entry = watchlistMap.get(movie.id);
    const inWatchlist = !!entry;

    useEffect(() => {
        setDetails(null);
        getMovieDetails(movie.id).then(setDetails).catch(() => {});
    }, [movie.id]);

    async function handleAdd() {
        if (adding) return;
        setAdding(true);
        try { await add(movie); } finally { setAdding(false); }
    }

    async function handleRemove() {
        if (removing) return;
        setRemoving(true);
        try { await remove(movie.id); } finally { setRemoving(false); }
    }

    const backdropPath  = movie.backdrop_path || details?.backdrop_path;
    const backdropUrl   = backdropPath
        ? `${BACKDROP_BASE_URL}${backdropPath}`
        : movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : null;

    const year         = movie.release_date?.slice(0, 4);
    const rawRating    = movie.vote_average > 0 ? movie.vote_average : (details?.vote_average ?? 0);
    const rating       = rawRating > 0 ? rawRating.toFixed(1) : null;
    const runtime      = details?.runtime
        ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
        : null;
    const genres       = details?.genres?.map(g => g.name) ?? [];
    const genresString = genres.join(' · ');
    const cast         = details?.credits?.cast?.slice(0, 6) ?? [];

    return (
        <>
            <div
                className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div
                    className="bg-[#141414] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Hero */}
                    <div className="relative aspect-video w-full bg-[#1a1a1a] flex-shrink-0">
                        {backdropUrl && (
                            <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/30 to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>

                        <div className="absolute bottom-4 left-6 right-6">
                            <h2 className="text-white text-2xl font-bold leading-tight">{movie.title}</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1.5">
                                {year && <span>{year}</span>}
                                {runtime && (
                                    <>
                                        <span className="text-gray-600">·</span>
                                        <span>{runtime}</span>
                                    </>
                                )}
                                {rating && (
                                    <>
                                        <span className="text-gray-600">·</span>
                                        <span className="flex items-center gap-1 text-yellow-500">
                                            <i className="fa-solid fa-star text-xs" />
                                            {rating}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5">
                        {genres.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {genres.map(g => (
                                    <span key={g} className="px-3 py-1 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-gray-300 text-xs">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}

                        {movie.overview && (
                            <p className="text-gray-400 text-sm leading-relaxed">{movie.overview}</p>
                        )}

                        {!details && (
                            <div className="flex justify-center py-2">
                                <i className="fa-solid fa-circle-notch fa-spin text-gray-600" />
                            </div>
                        )}

                        {cast.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Cast</p>
                                <p className="text-gray-400 text-sm">{cast.map(c => c.name).join(', ')}</p>
                            </div>
                        )}

                        {inWatchlist ? (
                            <>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your status</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {STATUSES.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => changeStatus(movie.id, s)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                    entry.status === s
                                                        ? 'bg-yellow-500 text-black'
                                                        : 'bg-[#1f1f1f] text-gray-400 hover:text-white border border-[#2a2a2a]'
                                                }`}
                                            >
                                                {STATUS_LABELS[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={handleRemove}
                                        disabled={removing}
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-red-500/10 border border-[#2a2a2a] hover:border-red-500/30 text-gray-400 hover:text-red-400 font-medium py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                                    >
                                        <i className={`fa-solid ${removing ? 'fa-circle-notch fa-spin' : 'fa-trash-can'}`} />
                                        {removing ? 'Removing…' : 'Remove from Watchlist'}
                                    </button>
                                    <button
                                        onClick={() => setShareOpen(true)}
                                        className="flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                                    >
                                        <i className="fa-solid fa-share-nodes" />
                                        Share
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={handleAdd}
                                    disabled={adding}
                                    className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg transition-colors text-sm"
                                >
                                    <i className={`fa-solid ${adding ? 'fa-circle-notch fa-spin' : 'fa-plus'}`} />
                                    {adding ? 'Adding…' : 'Add to Watchlist'}
                                </button>
                                <button
                                    onClick={() => setShareOpen(true)}
                                    className="flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                                >
                                    <i className="fa-solid fa-share-nodes" />
                                    Share
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {shareOpen && (
                <ShareModal
                    movie={movie}
                    genresString={genresString}
                    onClose={() => setShareOpen(false)}
                />
            )}
        </>
    );
}

function ShareModal({ movie, genresString, onClose }) {
    const { currentUser } = useAuth();
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [selectedUids, setSelectedUids] = useState(new Set());
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function load() {
            const token = await currentUser.getIdToken();
            const data = await getFriends(token, currentUser.uid);
            setFriends(data.friends);
            setLoadingFriends(false);
        }
        load();
    }, []);

    function toggleFriend(uid) {
        setSelectedUids(prev => {
            const next = new Set(prev);
            next.has(uid) ? next.delete(uid) : next.add(uid);
            return next;
        });
    }

    async function handleSend() {
        if (selectedUids.size === 0 || sending) return;
        setSending(true);
        try {
            const token = await currentUser.getIdToken();
            await sendRecommendation(token, {
                toUids: [...selectedUids],
                movieId: movie.id,
                title: movie.title,
                posterPath: movie.poster_path ?? null,
                genres: genresString,
                note: note.trim() || null,
            });
            setSent(true);
        } finally {
            setSending(false);
        }
    }

    function handleCopyLink() {
        navigator.clipboard.writeText(`https://www.themoviedb.org/movie/${movie.id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-5 py-4 border-b border-[#2a2a2a]">
                    <div>
                        <h3 className="text-white font-semibold text-sm">Recommend to Friends</h3>
                        <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[220px]">{movie.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors ml-3 flex-shrink-0"
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {sent ? (
                    <div className="flex flex-col items-center justify-center py-10 px-5">
                        <i className="fa-solid fa-circle-check text-yellow-500 text-3xl mb-3" />
                        <p className="text-white font-medium text-sm">Sent!</p>
                        <p className="text-gray-500 text-xs mt-1 text-center">Your recommendation is on its way.</p>
                        <button
                            onClick={onClose}
                            className="mt-5 text-gray-500 hover:text-white text-xs transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="p-5 space-y-4">
                        {/* Friends list */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 mb-2">Send to</p>
                            {loadingFriends ? (
                                <div className="flex justify-center py-4">
                                    <i className="fa-solid fa-circle-notch fa-spin text-gray-500" />
                                </div>
                            ) : friends.length === 0 ? (
                                <p className="text-gray-600 text-xs py-3 text-center bg-[#1a1a1a] rounded-lg">
                                    Add friends first to recommend movies.
                                </p>
                            ) : (
                                <div className="space-y-1 max-h-44 overflow-y-auto">
                                    {friends.map(f => {
                                        const selected = selectedUids.has(f.id);
                                        const initial = (f.displayName ?? f.username ?? '?')[0].toUpperCase();
                                        return (
                                            <button
                                                key={f.id}
                                                onClick={() => toggleFriend(f.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                    selected
                                                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                                                        : 'hover:bg-[#1a1a1a] border border-transparent'
                                                }`}
                                            >
                                                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#333]">
                                                    {f.avatarUrl
                                                        ? <img src={f.avatarUrl} alt={f.username} className="w-full h-full object-cover" />
                                                        : <span className="text-[10px] font-bold text-white">{initial}</span>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-xs font-medium truncate">{f.displayName ?? f.username}</p>
                                                    {f.username && <p className="text-gray-500 text-[10px]">@{f.username}</p>}
                                                </div>
                                                {selected && (
                                                    <i className="fa-solid fa-check text-yellow-500 text-xs flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Note */}
                        <div>
                            <p className="text-xs font-medium text-gray-400 mb-2">
                                Note <span className="text-gray-600 font-normal">(optional)</span>
                            </p>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Why should they watch this?"
                                rows={2}
                                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] focus:border-yellow-500/50 text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors resize-none placeholder-gray-600"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSend}
                                disabled={sending || selectedUids.size === 0}
                                className="flex-1 py-2 bg-yellow-500 text-black text-xs font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending
                                    ? <i className="fa-solid fa-circle-notch fa-spin" />
                                    : selectedUids.size === 0
                                        ? 'Select friends'
                                        : `Send to ${selectedUids.size} friend${selectedUids.size !== 1 ? 's' : ''}`
                                }
                            </button>
                            <button
                                onClick={handleCopyLink}
                                title="Copy movie link"
                                className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
                            >
                                <i className={`fa-solid ${copied ? 'fa-check text-green-400' : 'fa-link'}`} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
