export function renderSidebar(containerId, activePage = 'discover') {
    const container = document.getElementById(containerId);
    if (!container) return; // Tambahkan safety check

    container.innerHTML = `
        <aside class="w-64 bg-[#141414] border-r border-[#2a2a2a] flex flex-col h-full flex-shrink-0">
            <div class="h-20 flex items-center justify-center px-6">
                <a href="index.html" class="inline-block transition-transform hover:scale-105">
                    <h1 class="text-3xl font-serif font-bold italic tracking-wide text-white">CineSync</h1>
                </a>
            </div>
            
            <div class="px-6 pb-6 flex-1">
                <nav class="space-y-2 mt-4">
                    <a href="index.html" class="flex items-center gap-4 px-4 py-3 text-sm transition-colors rounded-lg ${activePage === 'home' ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
                        <i class="fa-solid fa-house w-5 text-center ${activePage === 'home' ? 'text-yellow-500' : ''}"></i> Home
                    </a>
                    <a href="discover.html" class="flex items-center gap-4 px-4 py-3 text-sm transition-colors rounded-lg ${activePage === 'discover' ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
                        <i class="fa-regular fa-compass w-5 text-center ${activePage === 'discover' ? 'text-yellow-500' : ''}"></i> Discover
                    </a>
                    <a href="trending-clips.html" class="flex items-center gap-4 px-4 py-3 text-sm transition-colors rounded-lg ${activePage === 'trending-clips' ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
                        <i class="fa-solid fa-chart-column w-5 text-center ${activePage === 'trending-clips' ? 'text-yellow-500' : ''}"></i> Trending Clips
                    </a>
                    <a href="watchlist.html" class="flex items-center gap-4 px-4 py-3 text-sm transition-colors rounded-lg ${activePage === 'watchlist' ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
                        <i class="fa-solid fa-list-ul w-5 text-center ${activePage === 'watchlist' ? 'text-yellow-500' : ''}"></i> Watchlist
                    </a>
                </nav>
            </div>
        </aside>
    `;
}