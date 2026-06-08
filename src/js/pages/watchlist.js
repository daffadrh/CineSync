import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { getWatchlist, updateWatchlistStatus, removeFromWatchlist } from '../services/watchlist-service.js';

renderSidebar('sidebar-container', 'watchlist');
renderHeader('header-container');

const grid = document.getElementById('watchlistGrid');
const emptyState = document.getElementById('emptyState');
const filterBar = document.getElementById('filterBar');

const GRADIENTS = ['clip-grad-1', 'clip-grad-2', 'clip-grad-3', 'clip-grad-4', 'clip-grad-5'];
const STATUS_FLOW = ['planned', 'watching', 'watched'];
const STATUS_LABEL = { planned: 'Planned', watching: 'Watching', watched: 'Watched' };
const STATUS_ICON = { planned: 'fa-regular fa-bookmark text-blue-400', watching: 'fa-solid fa-play text-yellow-500', watched: 'fa-solid fa-check text-green-400' };

let entries = [];
let activeFilter = 'all';

function gradientFor(entryId) {
    const index = entries.findIndex(e => e.id === entryId);
    return GRADIENTS[index % GRADIENTS.length];
}

function formatAddedDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateFilterCounts() {
    filterBar.querySelector('[data-count="all"]').textContent = entries.length;
    STATUS_FLOW.forEach(status => {
        filterBar.querySelector(`[data-count="${status}"]`).textContent = entries.filter(e => e.status === status).length;
    });
}

function render() {
    updateFilterCounts();
    const visible = activeFilter === 'all' ? entries : entries.filter(e => e.status === activeFilter);

    grid.innerHTML = visible.map(entry => `
        <div class="watch-item" data-entry-id="${entry.id}">
            <div class="watch-poster ${gradientFor(entry.id)} relative w-full rounded-xl overflow-hidden border border-[#2a2a2a] mb-2.5 flex flex-col justify-between p-3">
                <span class="self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 backdrop-blur-sm flex items-center gap-1.5">
                    <i class="${STATUS_ICON[entry.status]}"></i> ${STATUS_LABEL[entry.status]}
                </span>
                <p class="text-sm font-semibold text-white leading-tight">${entry.title}</p>
            </div>
            <div class="flex items-center justify-between gap-2 px-0.5">
                <p class="text-xs text-gray-500">Added ${formatAddedDate(entry.addedAt)}</p>
                <div class="flex items-center gap-1">
                    <button class="cycle-status-btn w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer" title="Move to next status">
                        <i class="fa-solid fa-rotate text-xs pointer-events-none"></i>
                    </button>
                    <button class="remove-btn w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer" title="Remove from watchlist">
                        <i class="fa-solid fa-trash text-xs pointer-events-none"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    emptyState.classList.toggle('hidden', entries.length > 0);
    grid.classList.toggle('hidden', entries.length === 0);
}

filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    activeFilter = btn.dataset.status;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    render();
});

grid.addEventListener('click', async (e) => {
    const item = e.target.closest('.watch-item');
    if (!item) return;
    const entryId = item.dataset.entryId;

    if (e.target.closest('.cycle-status-btn')) {
        const entry = entries.find(en => en.id === entryId);
        const nextStatus = STATUS_FLOW[(STATUS_FLOW.indexOf(entry.status) + 1) % STATUS_FLOW.length];
        await updateWatchlistStatus(entryId, nextStatus);
        entry.status = nextStatus;
        render();
    } else if (e.target.closest('.remove-btn')) {
        await removeFromWatchlist(entryId);
        entries = entries.filter(en => en.id !== entryId);
        render();
    }
});

async function init() {
    entries = await getWatchlist();
    render();
}

init();
