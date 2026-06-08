export function renderHeader(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <header class="h-20 flex items-center justify-between px-8 bg-[#0d0d0d] border-b border-transparent w-full">
            <div class="relative flex-1 mr-8">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <i class="fa-solid fa-magnifying-glass text-gray-500"></i>
                </div>
                <input type="text" id="searchInput" class="bg-[#1a1a1a] border border-[#333] text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-10 pr-10 p-2.5 outline-none transition-colors placeholder-gray-500" placeholder="Search for a title...">
                <button id="clearSearchBtn" class="absolute inset-y-0 right-0 flex items-center pr-4 hidden text-gray-400 hover:text-white transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>
            <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border border-[#333] cursor-pointer flex-shrink-0" onclick="window.location.href='/profile'">
                <i class="fa-solid fa-user text-gray-300"></i>
            </div>
        </header>
    `;
}