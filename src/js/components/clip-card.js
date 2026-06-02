export function createClipCard(clip) {
    const card = document.createElement('div');
    card.className = 'clip-card group';
    card.setAttribute('data-clip-id', clip.id);

    const tagsStr = Array.isArray(clip.tags) ? clip.tags.join(' ') : clip.tags;

    card.innerHTML = `
        <a href="clip-viewer.html?id=${clip.id}" class="block">
            <div class="clip-thumb ${clip.gradientClass} relative w-full rounded-xl overflow-hidden
                        border border-[#2a2a2a] group-hover:border-[#555] transition-colors mb-2.5"
                 style="aspect-ratio:9/16;">
                <button class="ctx-btn absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80
                               rounded-full flex items-center justify-center text-white border-none
                               cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        data-stop>
                    <i class="fa-solid fa-ellipsis-vertical text-xs pointer-events-none"></i>
                </button>
            </div>
        </a>
        <div class="flex items-start justify-between gap-2 px-0.5">
            <a href="clip-viewer.html?id=${clip.id}" class="min-w-0 flex-1 hover:opacity-80 transition-opacity">
                <p class="text-sm font-semibold text-white truncate leading-tight mb-0.5">${clip.title}</p>
                <p class="text-xs text-gray-500">${tagsStr}</p>
            </a>
            <button class="text-gray-500 hover:text-white transition-colors mt-0.5 flex-shrink-0
                           bg-transparent border-none cursor-pointer" data-stop>
                <i class="fa-solid fa-ellipsis-vertical text-sm pointer-events-none"></i>
            </button>
        </div>
    `;

    card.querySelectorAll('[data-stop]').forEach(btn => {
        btn.addEventListener('click', e => e.preventDefault());
    });

    return card;
}
