import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getFriends } from '../services/profile-service.js';
import { sendRecommendation } from '../services/recommendations-service.js';

export default function ShareModal({ movie, genresString, onClose }) {
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
