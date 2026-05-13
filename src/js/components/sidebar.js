export function renderSidebar(containerId, activePage = 'discover') {
    const container = document.getElementById(containerId);
    if (!container) return; 

    container.innerHTML = `
        <aside id="main-sidebar" class="bg-[#141414] border-r border-[#2a2a2a] flex flex-col h-full flex-shrink-0 relative select-none" style="width: 256px; min-width: 200px; max-width: 400px;">
            <div class="h-20 flex items-center justify-center px-6">
                <a href="index.html" class="inline-block transition-transform hover:scale-105">
                    <h1 class="text-3xl font-serif font-bold italic tracking-wide text-white">CineSync</h1>
                </a>
            </div>
            
            <div class="px-6 pb-6 flex-1 overflow-hidden whitespace-nowrap">
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
                    <a href="friend-recs.html" class="flex items-center gap-4 px-4 py-3 text-sm transition-colors rounded-lg ${activePage === 'friend-recs' ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}">
                        <i class="fa-solid fa-share-nodes w-5 text-center ${activePage === 'friend-recs' ? 'text-yellow-500' : ''}"></i> Friend Recs
                    </a>
                </nav>
            </div>

            <div id="sidebar-resizer" class="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-gray-500/50 active:bg-yellow-500 transition-colors z-50"></div>
        </aside>
    `;

    const sidebar = document.getElementById('main-sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        let newWidth = e.clientX;
        
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 400) newWidth = 400;
        
        sidebar.style.width = `${newWidth}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
        }
    });
}
