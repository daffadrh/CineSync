import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getRecommendations, getSentRecommendations } from '../services/recommendations-service.js';
import { useWatchlist } from '../context/WatchlistContext.jsx';
import { IMG_BASE_URL } from '../services/tmdb-api.js';
import SendRecommendationModal from '../components/SendRecommendationModal.jsx';

const TABS = [
    { key: 'received', label: 'Received' },
    { key: 'sent',     label: 'Sent' },
];

export default function Recommendations() {
    const { currentUser } = useAuth();
    const { watchlistMap, add } = useWatchlist();

    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('received');
    const [sendModalOpen, setSendModalOpen] = useState(false);

    const refreshSent = useCallback(async () => {
        const token = await currentUser.getIdToken();
        const data = await getSentRecommendations(token);
        setSent(data.recommendations);
    }, [currentUser]);

    useEffect(() => {
        async function load() {
            const token = await currentUser.getIdToken();
            const [receivedData, sentData] = await Promise.all([
                getRecommendations(token),
                getSentRecommendations(token),
            ]);
            setReceived(receivedData.recommendations);
            setSent(sentData.recommendations);
            setLoading(false);
        }
        load();
    }, []);

    function handleCloseSendModal() {
        setSendModalOpen(false);
        refreshSent();
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header — centered, fixed height */}
            <div className="px-8 pt-8 pb-6 flex-shrink-0">
                <div className="max-w-screen-xl mx-auto">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">For you</p>
                    <h1 className="text-4xl font-serif font-bold text-white">
                        <span className="italic text-yellow-500">Recommendations</span>.
                    </h1>
                </div>
            </div>

            {/* Tabs + scrollable content — fills remaining height */}
            <div className="flex-1 flex flex-col overflow-hidden px-8 pb-8">
                <div className="max-w-screen-xl mx-auto w-full flex flex-col flex-1 min-h-0">

                    {/* Tabs */}
                    <div className="flex items-center justify-between gap-2 mb-6 flex-shrink-0">
                        <div className="flex gap-2">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        activeTab === tab.key
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222]'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.key === 'received' && received.length > 0 && (
                                        <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                                            activeTab === 'received'
                                                ? 'bg-black/20 text-black'
                                                : 'bg-[#2a2a2a] text-gray-500'
                                        }`}>
                                            {received.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'sent' && (
                            <button
                                onClick={() => setSendModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-yellow-500 text-black text-sm font-medium rounded-full hover:bg-yellow-400 transition-colors"
                            >
                                <i className="fa-solid fa-paper-plane" />
                                Send Recommendation
                            </button>
                        )}
                    </div>

                    {/* Tab content — scrolls within remaining height */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === 'received' && (
                            received.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <i className="fa-solid fa-paper-plane text-gray-700 text-5xl mb-4" />
                                    <p className="text-gray-400 text-sm">No recommendations yet.</p>
                                    <p className="text-gray-600 text-xs mt-1">
                                        When a friend recommends a movie, it'll appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {received.map(rec => (
                                        <RecCard
                                            key={rec.id}
                                            rec={rec}
                                            isInWatchlist={watchlistMap.has(rec.movieId)}
                                            onAdd={() => add({
                                                id: rec.movieId,
                                                title: rec.title,
                                                poster_path: rec.posterPath,
                                                backdrop_path: null,
                                            })}
                                        />
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === 'sent' && (
                            sent.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <i className="fa-regular fa-paper-plane text-gray-700 text-5xl mb-4" />
                                    <p className="text-gray-400 text-sm">You haven't recommended anything yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sent.map(rec => (
                                        <SentRecCard key={rec.id} rec={rec} />
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                </div>
            </div>

            {sendModalOpen && (
                <SendRecommendationModal onClose={handleCloseSendModal} />
            )}
        </div>
    );
}

function RecCard({ rec, isInWatchlist, onAdd }) {
    const poster = rec.posterPath ? `${IMG_BASE_URL}${rec.posterPath}` : null;
    const senderInitial = (rec.from?.displayName ?? rec.from?.username ?? '?')[0].toUpperCase();

    return (
        <div className="flex gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl p-3">
            <div className="w-32 h-48 rounded-lg bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                {poster
                    ? <img src={poster} alt={rec.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600" />
                      </div>
                }
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <p className="text-white font-semibold text-xl truncate">{rec.title}</p>
                    {rec.genres && (
                        <p className="text-gray-500 text-sm mt-1">{rec.genres}</p>
                    )}
                    {rec.note && (
                        <p className="text-gray-300 text-base italic mt-4">"{rec.note}"</p>
                    )}
                </div>

                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {rec.from?.avatarUrl
                            ? <img src={rec.from.avatarUrl} alt={rec.from.username} className="w-full h-full object-cover" />
                            : <span className="text-[12px] font-bold text-white">{senderInitial}</span>
                        }
                    </div>
                    <span className="text-gray-500 text-sm">from @{rec.from?.username ?? 'unknown'}</span>
                </div>
            </div>

            <div className="flex-shrink-0 flex items-center">
                <button
                    onClick={onAdd}
                    disabled={isInWatchlist}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                        isInWatchlist
                            ? 'bg-[#1a1a1a] text-gray-500 cursor-default border border-[#2a2a2a]'
                            : 'bg-yellow-500 text-black hover:bg-yellow-400'
                    }`}
                >
                    {isInWatchlist
                        ? <><i className="fa-solid fa-check mr-1.5" />In Watchlist</>
                        : '+ Add to Watchlist'
                    }
                </button>
            </div>
        </div>
    );
}

function SentRecCard({ rec }) {
    const poster = rec.posterPath ? `${IMG_BASE_URL}${rec.posterPath}` : null;
    const recipientInitial = (rec.to?.displayName ?? rec.to?.username ?? '?')[0].toUpperCase();

    return (
        <div className="flex gap-4 bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="w-14 h-20 rounded-lg bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                {poster
                    ? <img src={poster} alt={rec.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600 text-sm" />
                      </div>
                }
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm mb-0.5 truncate">{rec.title}</p>
                {rec.genres && (
                    <p className="text-gray-500 text-xs mb-2">{rec.genres}</p>
                )}
                {rec.note && (
                    <p className="text-gray-300 text-xs italic mb-3">"{rec.note}"</p>
                )}

                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {rec.to?.avatarUrl
                            ? <img src={rec.to.avatarUrl} alt={rec.to.username} className="w-full h-full object-cover" />
                            : <span className="text-[16px] font-bold text-white">{recipientInitial}</span>
                        }
                    </div>
                    <span className="text-gray-500 text-xs">to @{rec.to?.username ?? 'unknown'}</span>
                </div>
            </div>
        </div>
    );
}
