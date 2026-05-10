import { IMG_BASE_URL, IMG_ORIGINAL_URL, getMovieDetails } from '../services/tmdb-api.js';

export function renderModal(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div id="quickViewModal" class="fixed inset-0 z-50 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 p-4">
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" id="modalBackdrop"></div>
            <div class="relative w-full max-w-4xl bg-[#141414] rounded-2xl overflow-y-auto hide-scrollbar shadow-2xl border border-[#333] transform scale-95 transition-transform duration-300 max-h-[90vh]" id="modalContentPanel">
                <button id="closeModalBtn" class="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition"><i class="fa-solid fa-xmark"></i></button>
                <div class="relative w-full h-72 bg-gray-800 flex-shrink-0">
                    <img id="modalBackdropImg" src="" alt="Backdrop" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent"></div>
                </div>
                <div class="p-8 -mt-20 relative z-10 flex flex-col">
                    <div class="flex gap-6">
                        <div class="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-[#333]">
                            <img id="modalPosterImg" src="" alt="Poster" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 mt-6">
                            <h2 id="modalTitle" class="text-3xl font-serif font-bold text-white mb-2"></h2>
                            <div class="flex items-center gap-3 text-sm text-gray-400 mb-4 flex-wrap">
                                <span class="flex items-center text-white font-medium">
                                    <i class="fa-solid fa-star text-yellow-500 mr-1"></i> <span id="modalRating" class="mr-1"></span>
                                    <span class="text-[10px] font-extrabold bg-gradient-to-r from-[#90cea1] to-[#01b4e4] text-transparent bg-clip-text border border-[#01b4e4]/30 px-1 rounded tracking-wider">TMDB</span>
                                </span>
                                <span>•</span><span id="modalYear"></span><span>•</span><span id="modalGenres"></span><span>•</span>
                                <span id="modalRuntime" class="text-gray-300"></span>
                            </div>
                            <div class="mb-6">
                                <p id="modalOverview" class="text-sm text-gray-300 leading-relaxed text-justify line-clamp-3 transition-all duration-300"></p>
                                <button id="seeMoreBtn" class="text-xs font-bold text-white hover:text-gray-300 mt-1 hidden focus:outline-none">See more</button>
                            </div>
                            <button class="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 w-max"><i class="fa-solid fa-plus"></i> Add to Watchlist</button>
                        </div>
                    </div>
                    <div class="mt-8 border-t border-[#333] pt-6">
                        <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider">Cast</h3>
                        <div id="modalCastGrid" class="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);
    
    document.getElementById('seeMoreBtn').addEventListener('click', () => {
        const overview = document.getElementById('modalOverview');
        const btn = document.getElementById('seeMoreBtn');
        if (overview.classList.contains('line-clamp-3')) {
            overview.classList.remove('line-clamp-3');
            btn.textContent = 'See less';
        } else {
            overview.classList.add('line-clamp-3');
            btn.textContent = 'See more';
        }
    });
}

export function closeModal() {
    const modal = document.getElementById('quickViewModal');
    const panel = document.getElementById('modalContentPanel');
    modal.classList.add('opacity-0', 'pointer-events-none');
    panel.classList.remove('scale-100');
    panel.classList.add('scale-95');
}

export async function openModal(movie, genreMap) {
    const modal = document.getElementById('quickViewModal');
    const panel = document.getElementById('modalContentPanel');
    const overview = document.getElementById('modalOverview');
    const seeMoreBtn = document.getElementById('seeMoreBtn');

    document.getElementById('modalTitle').textContent = movie.title;
    overview.classList.add('line-clamp-3');
    seeMoreBtn.classList.add('hidden');
    seeMoreBtn.textContent = 'See more';
    overview.textContent = movie.overview || 'No synopsis available.';
    
    document.getElementById('modalYear').textContent = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
    document.getElementById('modalRating').textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
    document.getElementById('modalGenres').textContent = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(', ') || 'Unknown Genre';

    document.getElementById('modalPosterImg').src = movie.poster_path ? `${IMG_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('modalBackdropImg').src = movie.backdrop_path ? `${IMG_ORIGINAL_URL}${movie.backdrop_path}` : 'https://via.placeholder.com/800x450?text=No+Backdrop';

    document.getElementById('modalRuntime').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1 text-yellow-500"></i> Loading...';
    document.getElementById('modalCastGrid').innerHTML = '<p class="text-sm text-gray-500"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading cast...</p>';

    modal.classList.remove('opacity-0', 'pointer-events-none');
    panel.classList.remove('scale-95');
    panel.classList.add('scale-100');

    setTimeout(() => { if (overview.scrollHeight > overview.clientHeight) seeMoreBtn.classList.remove('hidden'); }, 50);

    try {
        const details = await getMovieDetails(movie.id);
        if(details.runtime > 0) {
            const h = Math.floor(details.runtime / 60), m = details.runtime % 60;
            document.getElementById('modalRuntime').innerHTML = `<i class="fa-regular fa-clock mr-1"></i> ${h > 0 ? h+'h '+m+'m' : m+'m'}`;
        } else {
            document.getElementById('modalRuntime').innerHTML = 'N/A';
        }

        const castContainer = document.getElementById('modalCastGrid');
        castContainer.innerHTML = ''; 
        const topCast = details.credits.cast.slice(0, 15); 
        
        if(topCast.length === 0) castContainer.innerHTML = '<p class="text-sm text-gray-500">No cast info.</p>';
        else {
            topCast.forEach(actor => {
                const imgUrl = actor.profile_path ? `${IMG_BASE_URL}${actor.profile_path}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(actor.name) + '&background=333&color=fff';
                castContainer.insertAdjacentHTML('beforeend', `
                    <div class="w-24 flex-shrink-0 snap-start">
                        <div class="w-full aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-[#1a1a1a] border border-[#333]">
                            <img src="${imgUrl}" class="w-full h-full object-cover">
                        </div>
                        <h4 class="text-xs font-bold text-white truncate">${actor.name}</h4>
                        <p class="text-[10px] text-gray-400 leading-tight truncate mt-0.5">${actor.character}</p>
                    </div>`);
            });
        }
    } catch(e) {
        document.getElementById('modalRuntime').innerHTML = 'Error';
        document.getElementById('modalCastGrid').innerHTML = '<p class="text-sm text-red-500">Failed to load cast.</p>';
    }
}