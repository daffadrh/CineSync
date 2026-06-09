import { useState, useEffect } from 'react';
  import { useSearchParams, useNavigate } from 'react-router-dom';
  import { fetchTrending, fetchByMood, searchMovies, IMG_BASE_URL } from '../services/tmdb-api.js';
  import MovieModal from '../components/MovieModal.jsx';

const GENRE_MAP = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 18: 'Drama', 10751: 'Family', 14: 'Fantasy',
    27: 'Horror', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
    53: 'Thriller', 37: 'Western', 99: 'Documentary', 36: 'History',
};

const MOODS = [
      { label: 'Action-Packed',  icon: 'fa-regular fa-face-angry',      color: 'text-red-400',    genreId: 28   },
      { label: 'Tearjerker',     icon: 'fa-regular fa-face-sad-cry',     color: 'text-blue-400',   genreId: 18   },
      { label: 'Upbeat Comedy',  icon: 'fa-regular fa-face-laugh-beam',  color: 'text-yellow-400', genreId: 35   },
      { label: 'Mind-Bending',   icon: 'fa-regular fa-face-dizzy',       color: 'text-purple-400', genreId: 878  },
      { label: 'Calm & Relaxing',icon: 'fa-regular fa-face-smile-beam',  color: 'text-green-400',  genreId: 10749},
  ];

  export default function Discover() {
      const [searchParams] = useSearchParams();
      const navigate = useNavigate();
      const query = searchParams.get('q') ?? '';

      const [movies, setMovies] = useState([]);
      const [activeGenre, setActiveGenre] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [selectedMovie, setSelectedMovie] = useState(null);

      useEffect(() => {
          if (query) setActiveGenre(null);
      }, [query]);

      useEffect(() => {
          setLoading(true);
          setError(null);

          const fetcher = query
              ? searchMovies(query)
              : activeGenre
                  ? fetchByMood(activeGenre)
                  : fetchTrending();

          fetcher
              .then(data => setMovies(data.results ?? []))
              .catch(() => setError('Failed to load movies.'))
              .finally(() => setLoading(false));
      }, [query, activeGenre]);

      function handleMoodClick(genreId) {
          if (query) navigate('/discover');
          setActiveGenre(prev => prev === genreId ? null : genreId);
      }

      const activeMood = MOODS.find(m => m.genreId === activeGenre);
      const sectionTitle = query
          ? `Results for "${query}"`
          : activeMood
              ? activeMood.label
              : 'Trending This Week';

      return (
          <div className="flex flex-col h-full">

              {/* Header — only when not in search mode, pinned above scroll */}
              {!query && (
                  <div className="flex-shrink-0 px-8 pt-8 pb-6">
                      <div className="max-w-screen-xl mx-auto">
                          <div className="mb-8">
                              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                                  Explore the cinematic world
                              </p>
                              <h1 className="text-4xl font-serif font-bold text-white">
                                  Find your next{' '}
                                  <span className="italic text-yellow-500">obsession</span>.
                              </h1>
                          </div>
                          <div>
                              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
                                  How are you feeling today?
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                  {MOODS.map(mood => (
                                      <button
                                          key={mood.genreId}
                                          onClick={() => handleMoodClick(mood.genreId)}
                                          className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-colors ${
                                              activeGenre === mood.genreId
                                                  ? 'bg-yellow-500 text-black'
                                                  : 'bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222]'
                                          }`}
                                      >
                                          <i className={`${mood.icon} ${activeGenre === mood.genreId ? 'text-black' : mood.color}`} />
                                          {mood.label}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Scrollable content */}
              <div className={`flex-1 overflow-y-auto px-8 pb-8 ${query ? 'pt-8' : ''}`}>
                  <div className="max-w-screen-xl mx-auto">
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                          {sectionTitle}
                      </h2>

                      {loading && (
                          <div className="flex justify-center py-20">
                              <i className="fa-solid fa-circle-notch fa-spin text-gray-500 text-2xl" />
                          </div>
                      )}

                      {error && <p className="text-red-400 text-sm">{error}</p>}

                      {!loading && !error && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                              {movies.map(movie => (
                                  <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              {selectedMovie && (
                  <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
              )}
          </div>
  );
  }

  function MovieCard({ movie, onClick }) {
      const year = movie.release_date?.slice(0, 4);
      const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
      const imageUrl = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : null;
      const genres = (movie.genre_ids ?? []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);

      return (
          <div className="group cursor-pointer" onClick={onClick}>
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                  {imageUrl
                      ? <img
                          src={imageUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      : <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-film text-gray-600 text-2xl" />
                        </div>
                  }
              </div>
              <p className="text-white text-sm font-medium truncate mt-2">{movie.title}</p>
              {genres.length > 0 && (
                  <p className="text-gray-500 text-xs truncate mt-0.5">{genres.join(' · ')}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  {year && <span>{year}</span>}
                  {year && rating && <span className="text-gray-600">·</span>}
                  {rating && (
                      <span className="flex items-center gap-1 text-yellow-500">
                          <i className="fa-solid fa-star text-[10px]" />
                          {rating}
                      </span>
                  )}
              </div>
          </div>
      );
  }
