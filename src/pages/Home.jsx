import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWatchlist, STATUS_LABELS, STATUS_COLORS, STATUSES } from '../context/WatchlistContext.jsx';
import { fetchTrending, getMovieDetails, IMG_BASE_URL } from '../services/tmdb-api.js';
import { getRecommendations } from '../services/recommendations-service.js';
import MovieModal from '../components/MovieModal.jsx';

export default function Home() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { watchlistMap, loaded: watchlistLoaded } = useWatchlist();

    const [trending, setTrending]       = useState([]);
    const [recs, setRecs]               = useState([]);
    const [heroDetails, setHeroDetails] = useState(null);
    const [loading, setLoading]         = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);

    const watchlistEntries = [...watchlistMap.values()].sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
    );
    const heroEntry  = watchlistEntries[0] ?? null;
    const moreEntries = watchlistEntries.slice(1, 6);

    useEffect(() => {
        async function load() {
            const fetches = [fetchTrending()];
            if (currentUser) {
                fetches.push(currentUser.getIdToken().then(t => getRecommendations(t)));
            }
            const results = await Promise.allSettled(fetches);
            setTrending(results[0].status === 'fulfilled' ? results[0].value.results ?? [] : []);
            if (results[1]) {
                setRecs(results[1].status === 'fulfilled' ? results[1].value?.recommendations ?? [] : []);
            }
            setLoading(false);
        }
        load();
    }, [currentUser]);

    useEffect(() => {
        if (!heroEntry) return;
        setHeroDetails(null);
        getMovieDetails(heroEntry.movieId).then(setHeroDetails).catch(() => {});
    }, [heroEntry?.movieId]);

    function handleHeroShare() {
        if (!heroEntry) return;
        setSelectedMovie({
            id: heroEntry.movieId,
            title: heroEntry.title,
            poster_path: heroEntry.posterPath ?? null,
            backdrop_path: heroEntry.backdropPath ?? null,
            release_date: heroDetails?.release_date ?? null,
            vote_average: heroDetails?.vote_average ?? 0,
            overview: heroDetails?.overview ?? '',
            genre_ids: heroDetails?.genres?.map(g => g.id) ?? [],
        });
    }

    if (loading || !watchlistLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-8 py-8">
                    <div className="max-w-screen-xl mx-auto space-y-10">

                        <WelcomeHero
                            onLogin={() => navigate('/login')}
                            onSignUp={() => navigate('/register')}
                            onExplore={() => navigate('/discover')}
                        />

                        {/* Trending strip */}
                        {trending.length > 0 && (
                            <section>
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                                    Trending This Week
                                </p>
                                <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                                    {trending.map(movie => (
                                        <TrendingCard
                                            key={movie.id}
                                            movie={movie}
                                            onClick={() => setSelectedMovie(movie)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>

                {selectedMovie && (
                    <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="max-w-screen-xl mx-auto space-y-10">

                    {/* Page header */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your space</p>
                        <h1 className="text-4xl font-serif font-bold text-white">
                            Pick up where you <span className="italic text-yellow-500">left off</span>.
                        </h1>
                    </div>

                    {/* Hero */}
                    <HeroCard
                        entry={heroEntry}
                        details={heroDetails}
                        onShare={handleHeroShare}
                        onExplore={() => navigate('/discover')}
                    />

                    {/* Trending strip */}
                    {trending.length > 0 && (
                        <section>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                                Trending This Week
                            </p>
                            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                                {trending.map(movie => (
                                    <TrendingCard
                                        key={movie.id}
                                        movie={movie}
                                        onClick={() => setSelectedMovie(movie)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Two-column section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <WatchlistCard entries={moreEntries} onViewAll={() => navigate('/watchlist')} />
                        <RecsCard recs={recs.slice(0, 3)} onViewAll={() => navigate('/recommendations')} />
                    </div>

                </div>
            </div>

            {selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
            )}
        </div>
    );
}

function WelcomeHero({ onLogin, onSignUp, onExplore }) {
    return (
        <div className="flex flex-col items-center justify-center bg-[#141414] border border-[#2a2a2a] rounded-2xl p-12 text-center">
            <h1 className="text-4xl font-serif font-bold text-white mb-3">
                Welcome to <span className="italic text-yellow-500">CineSync</span>.
            </h1>
            <p className="text-gray-500 text-sm mb-6 max-w-md">
                Track what you're watching, share clips, and get recommendations from friends.
                Log in or sign up to build your watchlist.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
                <button
                    onClick={onLogin}
                    className="px-5 py-2.5 bg-yellow-500 text-black text-sm font-semibold rounded-full hover:bg-yellow-400 transition-colors"
                >
                    Log In
                </button>
                <button
                    onClick={onSignUp}
                    className="px-5 py-2.5 bg-[#1f1f1f] border border-[#2a2a2a] text-gray-300 text-sm font-semibold rounded-full hover:bg-[#252525] hover:text-white transition-colors"
                >
                    Sign Up
                </button>
                <button
                    onClick={onExplore}
                    className="px-5 py-2.5 bg-[#1f1f1f] border border-[#2a2a2a] text-gray-300 text-sm font-semibold rounded-full hover:bg-[#252525] hover:text-white transition-colors"
                >
                    Browse Movies
                </button>
            </div>
        </div>
    );
}

function HeroCard({ entry, details, onShare, onExplore }) {
    const { changeStatus, watchlistMap } = useWatchlist();
    const poster = entry?.posterPath ? `${IMG_BASE_URL}${entry.posterPath}` : null;

    if (!entry) {
        return (
            <div className="flex flex-col items-center justify-center bg-[#141414] border border-[#2a2a2a] rounded-2xl p-12 text-center">
                <i className="fa-solid fa-film text-gray-700 text-5xl mb-4" />
                <p className="text-white font-semibold text-lg mb-1">Your watchlist is empty</p>
                <p className="text-gray-500 text-sm mb-4">Head to Discover to find your first movie.</p>
                <button
                    onClick={onExplore}
                    className="px-5 py-2 bg-yellow-500 text-black text-sm font-semibold rounded-full hover:bg-yellow-400 transition-colors"
                >
                    Explore Movies
                </button>
            </div>
        );
    }

    const liveEntry = watchlistMap.get(entry.movieId) ?? entry;
    const year      = details?.release_date?.slice(0, 4);
    const rating    = details?.vote_average > 0 ? details.vote_average.toFixed(1) : null;
    const genres    = details?.genres?.map(g => g.name) ?? [];

    return (
        <div className="flex gap-6 bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
            {/* Poster */}
            <div className="w-44 h-64 rounded-xl bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                {poster
                    ? <img src={poster} alt={entry.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600 text-2xl" />
                      </div>
                }
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Recently Added</p>

                    <h2 className="text-3xl font-serif font-bold text-white leading-tight">{entry.title}</h2>

                    {/* Rating + year */}
                    {(rating || year) ? (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            {rating && (
                                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                                    <i className="fa-solid fa-star text-xs" />{rating}
                                </span>
                            )}
                            {rating && year && <span className="text-gray-600">·</span>}
                            {year && <span>{year}</span>}
                        </div>
                    ) : (
                        /* Shimmer while details load */
                        <div className="flex gap-2">
                            <div className="h-4 w-16 bg-[#1f1f1f] rounded-full animate-pulse" />
                            <div className="h-4 w-10 bg-[#1f1f1f] rounded-full animate-pulse" />
                        </div>
                    )}

                    {/* Genres */}
                    {genres.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {genres.slice(0, 4).map(g => (
                                <span key={g} className="px-2.5 py-1 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-gray-400 text-xs">
                                    {g}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Status buttons */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Your status</p>
                        <div className="flex gap-2 flex-wrap">
                            {STATUSES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => changeStatus(entry.movieId, s)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        liveEntry.status === s
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-[#1f1f1f] text-gray-400 hover:text-white border border-[#2a2a2a]'
                                    }`}
                                >
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommend */}
                <button
                    onClick={onShare}
                    className="self-start flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] hover:bg-[#252525] border border-[#2a2a2a] text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-colors mt-4"
                >
                    <i className="fa-solid fa-paper-plane text-xs" />
                    Recommend
                </button>
            </div>
        </div>
    );
}

function TrendingCard({ movie, onClick }) {
    const poster = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : null;
    const year   = movie.release_date?.slice(0, 4);
    const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;

    return (
        <div className="flex-shrink-0 w-32 cursor-pointer group" onClick={onClick}>
            <div className="w-32 aspect-[2/3] rounded-lg bg-[#1a1a1a] overflow-hidden mb-1.5">
                {poster
                    ? <img src={poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-600" />
                      </div>
                }
            </div>
            <p className="text-white text-xs font-medium truncate">{movie.title}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                {year && <span>{year}</span>}
                {year && rating && <span className="text-gray-600">·</span>}
                {rating && (
                    <span className="flex items-center gap-0.5 text-yellow-500">
                        <i className="fa-solid fa-star text-[9px]" />{rating}
                    </span>
                )}
            </div>
        </div>
    );
}

function WatchlistCard({ entries, onViewAll }) {
    return (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Your Watchlist</h3>
                <button onClick={onViewAll} className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">
                    See all →
                </button>
            </div>
            {entries.length === 0 ? (
                <p className="text-gray-600 text-sm py-4 text-center">Nothing else in your watchlist.</p>
            ) : (
                <div className="space-y-3">
                    {entries.map(entry => (
                        <WatchlistRow key={entry.id} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}

function WatchlistRow({ entry }) {
    const poster = entry.posterPath ? `${IMG_BASE_URL}${entry.posterPath}` : null;
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 aspect-[2/3] rounded-lg bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                {poster
                    ? <img src={poster} alt={entry.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-700 text-xs" />
                      </div>
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{entry.title}</p>
                <p className="text-gray-500 text-xs">{STATUS_LABELS[entry.status] ?? entry.status}</p>
            </div>
        </div>
    );
}

function RecsCard({ recs, onViewAll }) {
    return (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Recommended for You</h3>
                <button onClick={onViewAll} className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">
                    See all →
                </button>
            </div>
            {recs.length === 0 ? (
                <p className="text-gray-600 text-sm py-4 text-center">No recommendations yet.</p>
            ) : (
                <div className="space-y-3">
                    {recs.map(rec => (
                        <RecRow key={rec.id} rec={rec} />
                    ))}
                </div>
            )}
        </div>
    );
}

function RecRow({ rec }) {
    const { watchlistMap, add } = useWatchlist();
    const [adding, setAdding]  = useState(false);
    const poster               = rec.posterPath ? `${IMG_BASE_URL}${rec.posterPath}` : null;
    const inWatchlist          = watchlistMap.has(rec.movieId);

    async function handleAdd() {
        if (adding || inWatchlist) return;
        setAdding(true);
        try {
            await add({
                id: rec.movieId,
                title: rec.title,
                poster_path: rec.posterPath ?? null,
                backdrop_path: null,
            });
        } finally {
            setAdding(false);
        }
    }

    return (
        <div className="flex items-center gap-3">
            <div className="w-12 aspect-[2/3] rounded-lg bg-[#1a1a1a] flex-shrink-0 overflow-hidden">
                {poster
                    ? <img src={poster} alt={rec.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-film text-gray-700 text-xs" />
                      </div>
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{rec.title}</p>
                <p className="text-gray-500 text-xs truncate">from @{rec.from?.username ?? 'unknown'}</p>
            </div>
            <button
                onClick={handleAdd}
                disabled={inWatchlist || adding}
                title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    inWatchlist
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400 cursor-default'
                        : adding
                            ? 'bg-[#1f1f1f] border border-[#2a2a2a] text-yellow-500 cursor-default'
                            : 'bg-[#1f1f1f] border border-[#2a2a2a] text-gray-400 hover:bg-yellow-500 hover:border-yellow-500 hover:text-black'
                }`}
            >
                <i className={`text-[10px] fa-solid ${
                    inWatchlist ? 'fa-check' : adding ? 'fa-circle-notch fa-spin' : 'fa-plus'
                }`} />
            </button>
        </div>
    );
}
