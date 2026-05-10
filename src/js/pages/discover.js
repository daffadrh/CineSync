import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { renderModal, openModal } from '../components/modal.js';
import { fetchGenresAPI, fetchTrendingAPI, fetchByMoodAPI, searchMoviesAPI, IMG_BASE_URL } from '../services/tmdb-api.js';

// Init Components
renderSidebar('sidebar-container', 'discover');
renderHeader('header-container');
renderModal('modal-container');

// DOM Elements
const contentSection = document.getElementById('contentSection');
const movieGridWrapper = document.getElementById('movieGridWrapper');
const movieContainer = document.getElementById('movieContainer');
const sectionTitle = document.getElementById('sectionTitle');
const titleIcon = document.getElementById('titleIcon');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const moodButtons = document.querySelectorAll('.mood-btn');
const heroSection = document.getElementById('heroSection');
const searchFooter = document.getElementById('searchFooter');
const searchControls = document.getElementById('searchControls');
const sortDropdown = document.getElementById('sortDropdown');
const exactMatchToggle = document.getElementById('exactMatchToggle');

// State
let genreMap = {};
let activeMoodBtn = null;
let searchResultsOriginal = [];
let searchResultsCurrent = [];
let currentSearchQuery = '';
let trendingCache = [];
let moodCache = [];

async function init() {
    const data = await fetchGenresAPI();
    data.genres.forEach(g => genreMap[g.id] = g.name);
    fetchTrending2026(false);
}

function startSearchFadeOut() {
    if (!heroSection.classList.contains('hidden')) {
        heroSection.classList.remove('fade-in-up');
        heroSection.classList.add('fade-out-down', 'opacity-0');
    }
    contentSection.classList.remove('fade-in-up');
    contentSection.classList.add('fade-out-down', 'opacity-0');
}
function startContentOnlyFadeOut() {
    contentSection.classList.remove('fade-in-up');
    contentSection.classList.add('fade-out-down', 'opacity-0');
}
function startGridOnlyFadeOut() {
    movieGridWrapper.classList.remove('fade-in-up');
    movieGridWrapper.classList.add('fade-out-down', 'opacity-0');
}
function triggerFadeInBoth() {
    if (!heroSection.classList.contains('hidden')) {
        heroSection.classList.remove('fade-out-down', 'opacity-0');
        heroSection.classList.add('fade-in-up');
    }
    contentSection.classList.remove('fade-out-down', 'opacity-0');
    contentSection.classList.add('fade-in-up');
}
function triggerFadeInContentOnly() {
    contentSection.classList.remove('fade-out-down', 'opacity-0');
    contentSection.classList.add('fade-in-up');
}
function triggerFadeInGridOnly() {
    movieGridWrapper.classList.remove('fade-out-down', 'opacity-0');
    movieGridWrapper.classList.add('fade-in-up');
}

async function fetchTrending2026(fromSearchReset = false) {
    if(fromSearchReset) startSearchFadeOut();
    else startContentOnlyFadeOut();
    
    if(trendingCache.length === 0) {
        const data = await fetchTrendingAPI();
        trendingCache = data.results.slice(0, 10); 
    }
    setTimeout(() => {
        if(fromSearchReset) heroSection.classList.remove('hidden');
        renderMovies(trendingCache, 'horizontal', 'Trending This Week', 'fa-fire', false);
        searchFooter.classList.add('hidden');
        if(fromSearchReset) triggerFadeInBoth();
        else triggerFadeInContentOnly();
    }, 400);
}

async function fetchByMood(genreId, moodName) {
    startContentOnlyFadeOut();
    const data = await fetchByMoodAPI(genreId);
    moodCache = data.results;
    setTimeout(() => {
        renderMovies(moodCache, 'grid', `${moodName} Recommendations`, 'fa-clapperboard', false);
        searchFooter.classList.add('hidden');
        triggerFadeInContentOnly();
    }, 400);
}

async function handleSearch(query) {
    if (!query.trim()) return resetToHome();
    currentSearchQuery = query;
    startSearchFadeOut(); 
    
    const pages = await searchMoviesAPI(query);
    let allResults = [];
    pages.forEach(p => { if(p.results) allResults = allResults.concat(p.results); });
    
    const unique = Array.from(new Set(allResults.map(a => a.id))).map(id => allResults.find(a => a.id === id));
    const finalResults = unique.slice(0, 100);
    
    searchResultsOriginal = [...finalResults];
    searchResultsCurrent = [...finalResults];
    sortDropdown.value = 'relevancy';
    exactMatchToggle.checked = false;

    setTimeout(() => {
        heroSection.classList.add('hidden'); 
        renderMovies(searchResultsCurrent, 'grid', `Search Results for "${query}"`, 'fa-magnifying-glass', true);
        searchFooter.classList.remove('hidden');
        triggerFadeInBoth(); 
    }, 400);
}

function renderMovies(movies, layoutType, title, iconClass, isSearch = false) {
    sectionTitle.textContent = title;
    titleIcon.className = `fa-solid ${iconClass} text-orange-500`;
    movieContainer.innerHTML = '';

    if (layoutType === 'horizontal') {
        movieContainer.className = 'flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x w-full';
        searchControls.classList.add('hidden');
    } else {
        movieContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4 w-full';
        isSearch ? searchControls.classList.remove('hidden') : searchControls.classList.add('hidden');
    }

    if (movies.length === 0) return movieContainer.innerHTML = '<p class="text-gray-500 italic">No movies found.</p>';

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        const card = document.createElement('div');
        card.className = `movie-card group cursor-pointer ${layoutType === 'horizontal' ? 'flex-shrink-0 w-56 snap-start' : 'w-full'}`;
        card.setAttribute('data-title', movie.title);

        if (isSearch && exactMatchToggle.checked && movie.title.toLowerCase() !== currentSearchQuery.toLowerCase()) {
            card.classList.add('exact-hidden', 'exact-removed');
        }

        const genres = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 2).join(', ');
        card.innerHTML = `
            <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-[#333] group-hover:border-gray-500 transition-colors">
                <img src="${IMG_BASE_URL}${movie.poster_path}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                <div class="absolute inset-0 card-gradient"></div>
                <h4 class="absolute bottom-4 left-4 right-4 text-white font-serif font-bold text-lg leading-tight drop-shadow-md z-10">${movie.title}</h4>
            </div>
            <div class="px-1">
                <h5 class="font-bold text-sm text-white mb-1 truncate">${movie.title}</h5>
                <p class="text-xs text-gray-400 mb-1">${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'} ${genres ? `· ${genres}` : ''}</p>
                <p class="flex items-center text-xs text-yellow-500 font-semibold">
                    <i class="fa-solid fa-star mr-1"></i> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}
                    <span class="text-[9px] font-extrabold bg-gradient-to-r from-[#90cea1] to-[#01b4e4] text-transparent bg-clip-text border border-[#01b4e4]/30 px-1 rounded ml-1 tracking-wider">TMDB</span>
                </p>
            </div>
        `;
        card.addEventListener('click', () => openModal(movie, genreMap));
        movieContainer.appendChild(card);
    });
}

function resetToHome() {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    currentSearchQuery = '';
    startSearchFadeOut();
    setTimeout(() => {
        heroSection.classList.remove('hidden');
        if (activeMoodBtn) renderMovies(moodCache, 'grid', `${activeMoodBtn.textContent.trim()} Recommendations`, 'fa-clapperboard', false);
        else renderMovies(trendingCache, 'horizontal', 'Trending This Week', 'fa-fire', false);
        searchFooter.classList.add('hidden');
        triggerFadeInBoth();
    }, 400);
}

// Listeners
searchInput.addEventListener('input', e => e.target.value.trim().length > 0 ? clearSearchBtn.classList.remove('hidden') : clearSearchBtn.classList.add('hidden'));
searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(e.target.value); });
clearSearchBtn.addEventListener('click', resetToHome);

exactMatchToggle.addEventListener('change', e => {
    document.querySelectorAll('.movie-card').forEach(card => {
        if (card.getAttribute('data-title').toLowerCase() !== currentSearchQuery.toLowerCase()) {
            if (e.target.checked) {
                card.classList.add('exact-hidden');
                setTimeout(() => { if(exactMatchToggle.checked) card.classList.add('exact-removed'); }, 400); 
            } else {
                card.classList.remove('exact-removed');
                void card.offsetWidth; 
                card.classList.remove('exact-hidden');
            }
        }
    });
});

sortDropdown.addEventListener('change', e => {
    startGridOnlyFadeOut();
    setTimeout(() => {
        let sorted = [...searchResultsCurrent];
        if (e.target.value === 'relevancy') sorted = [...searchResultsOriginal];
        else if (e.target.value === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title));
        else if (e.target.value === 'newest') sorted.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
        else if (e.target.value === 'oldest') sorted.sort((a, b) => new Date(a.release_date || new Date()) - new Date(b.release_date || new Date()));
        else if (e.target.value === 'highest') sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        
        searchResultsCurrent = sorted;
        renderMovies(searchResultsCurrent, 'grid', `Search Results for "${currentSearchQuery}"`, 'fa-magnifying-glass', true);
        triggerFadeInGridOnly();
    }, 400);
});

moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const isActive = btn.classList.contains('border-yellow-500');
        moodButtons.forEach(b => { b.classList.remove('border-yellow-500', 'bg-[#222]'); b.classList.add('border-[#333]', 'bg-[#1a1a1a]'); });
        if (isActive) {
            activeMoodBtn = null;
            if(searchInput.value.trim() !== '') resetToHome(); 
            else fetchTrending2026(false);
        } else {
            btn.classList.remove('border-[#333]', 'bg-[#1a1a1a]');
            btn.classList.add('border-yellow-500', 'bg-[#222]');
            activeMoodBtn = btn;
            
            if (searchInput.value.trim() !== '') {
                searchInput.value = '';
                clearSearchBtn.classList.add('hidden');
                startSearchFadeOut();
                setTimeout(() => {
                    heroSection.classList.remove('hidden');
                    fetchByMood(btn.getAttribute('data-genre'), btn.textContent.trim());
                    triggerFadeInBoth();
                }, 400);
            } else {
                fetchByMood(btn.getAttribute('data-genre'), btn.textContent.trim());
            }
        }
    });
});

init();