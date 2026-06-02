import { MOCK_FRIENDS } from '../services/clips-data.js';

export function renderSharePopup(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const friendsHTML = MOCK_FRIENDS.map(f => `
        <button class="friend-share-btn flex flex-col items-center gap-1 cursor-pointer
                       bg-transparent border-none p-0 group">
            <div class="w-12 h-12 rounded-full flex items-center justify-center
                        text-white text-lg font-bold transition-opacity group-hover:opacity-80"
                 style="background:${f.color};">
                ${f.initial}
            </div>
        </button>
    `).join('');

    container.innerHTML = `
        <div id="sharePopupOverlay"
             class="fixed inset-0 z-[60] flex items-center justify-center
                    opacity-0 pointer-events-none transition-opacity duration-250">

            <div id="sharePopupBackdrop" class="absolute inset-0 bg-black/60"></div>

            <div class="relative bg-[#141414] border border-[#2a2a2a] rounded-[18px]
                        p-7 w-[380px] shadow-2xl">

                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <span class="font-serif text-2xl font-semibold italic text-yellow-500">Share</span>
                    <button id="sharePopupCloseBtn"
                            class="w-8 h-8 rounded-full bg-transparent hover:bg-white/8
                                   border-none text-white flex items-center justify-center
                                   cursor-pointer transition-colors text-base">
                        <i class="fa-solid fa-xmark pointer-events-none"></i>
                    </button>
                </div>

                <!-- Friends row -->
                <div class="flex items-center gap-2.5 mb-5">
                    <button class="share-chevron w-8 h-8 rounded-full bg-white/5 border border-[#333]
                                   text-gray-400 hover:text-white hover:bg-white/10 flex items-center
                                   justify-center flex-shrink-0 cursor-pointer transition-colors text-xs">
                        <i class="fa-solid fa-chevron-left pointer-events-none"></i>
                    </button>
                    ${friendsHTML}
                    <button class="share-chevron w-8 h-8 rounded-full bg-white/5 border border-[#333]
                                   text-gray-400 hover:text-white hover:bg-white/10 flex items-center
                                   justify-center flex-shrink-0 cursor-pointer transition-colors text-xs">
                        <i class="fa-solid fa-chevron-right pointer-events-none"></i>
                    </button>
                </div>

                <!-- Divider -->
                <div class="h-px bg-[#2a2a2a] mb-5"></div>

                <!-- Platform row -->
                <div class="flex items-center gap-2 mb-6">
                    <button class="share-chevron w-8 h-8 rounded-full bg-white/5 border border-[#333]
                                   text-gray-400 hover:text-white hover:bg-white/10 flex items-center
                                   justify-center flex-shrink-0 cursor-pointer transition-colors text-xs">
                        <i class="fa-solid fa-chevron-left pointer-events-none"></i>
                    </button>

                    <div class="flex-1 flex items-center justify-between">
                        <button class="platform-btn flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer group">
                            <div class="w-[52px] h-[52px] rounded-full bg-black border border-[#333]
                                        flex items-center justify-center text-white text-xl
                                        group-hover:opacity-80 transition-opacity">
                                <i class="fa-brands fa-x-twitter pointer-events-none"></i>
                            </div>
                            <span class="text-[11px] text-gray-400">X</span>
                        </button>
                        <button class="platform-btn flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer group">
                            <div class="w-[52px] h-[52px] rounded-full flex items-center justify-center
                                        text-white text-xl group-hover:opacity-80 transition-opacity"
                                 style="background:#1877f2;">
                                <i class="fa-brands fa-facebook-f pointer-events-none"></i>
                            </div>
                            <span class="text-[11px] text-gray-400">Facebook</span>
                        </button>
                        <button class="platform-btn flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer group">
                            <div class="w-[52px] h-[52px] rounded-full flex items-center justify-center
                                        text-white text-xl group-hover:opacity-80 transition-opacity"
                                 style="background:#25d366;">
                                <i class="fa-brands fa-whatsapp pointer-events-none"></i>
                            </div>
                            <span class="text-[11px] text-gray-400">Whatsapp</span>
                        </button>
                        <button class="platform-btn flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer group">
                            <div class="w-[52px] h-[52px] rounded-full flex items-center justify-center
                                        text-white text-xl group-hover:opacity-80 transition-opacity"
                                 style="background:#6b7280;">
                                <i class="fa-solid fa-envelope pointer-events-none"></i>
                            </div>
                            <span class="text-[11px] text-gray-400">Mail</span>
                        </button>
                        <button class="platform-btn flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer group">
                            <div class="w-[52px] h-[52px] rounded-full flex items-center justify-center
                                        text-white text-xl group-hover:opacity-80 transition-opacity"
                                 style="background:#ff4500;">
                                <i class="fa-brands fa-reddit-alien pointer-events-none"></i>
                            </div>
                            <span class="text-[11px] text-gray-400">Reddit</span>
                        </button>
                    </div>

                    <button class="share-chevron w-8 h-8 rounded-full bg-white/5 border border-[#333]
                                   text-gray-400 hover:text-white hover:bg-white/10 flex items-center
                                   justify-center flex-shrink-0 cursor-pointer transition-colors text-xs">
                        <i class="fa-solid fa-chevron-right pointer-events-none"></i>
                    </button>
                </div>

                <!-- Link copy row -->
                <div class="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#333]
                            rounded-xl px-3.5 py-2.5">
                    <span id="shareUrlText" class="flex-1 text-xs text-gray-500 truncate">
                        https://cinesync.com/clips/o7UKz8ZBRP4
                    </span>
                    <button id="shareCopyBtn"
                            class="text-xs font-semibold text-gray-400 hover:text-white bg-transparent
                                   border-none cursor-pointer transition-colors px-2 py-1 rounded-md
                                   hover:bg-white/5 whitespace-nowrap font-['Inter']">
                        Copy
                    </button>
                </div>

            </div>
        </div>
    `;

    // Events
    document.getElementById('sharePopupBackdrop').addEventListener('click', closeSharePopup);
    document.getElementById('sharePopupCloseBtn').addEventListener('click', closeSharePopup);
    document.getElementById('shareCopyBtn').addEventListener('click', _handleCopy);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSharePopup();
    });
}

export function openSharePopup(clip) {
    const overlay = document.getElementById('sharePopupOverlay');
    if (!overlay) return;

    // Update URL
    if (clip) {
        const url = `https://cinesync.com/clips/${clip.id}`;
        const urlEl = document.getElementById('shareUrlText');
        if (urlEl) urlEl.textContent = url;
    }

    // Reset copy btn
    const btn = document.getElementById('shareCopyBtn');
    if (btn) { btn.textContent = 'Copy'; btn.style.color = ''; }

    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
}

export function closeSharePopup() {
    const overlay = document.getElementById('sharePopupOverlay');
    if (!overlay) return;
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100');
}

function _handleCopy() {
    const btn = document.getElementById('shareCopyBtn');
    const url = document.getElementById('shareUrlText')?.textContent ?? '';
    navigator.clipboard?.writeText(url).catch(() => {});
    if (!btn) return;
    btn.textContent = 'Copied!';
    btn.style.color = '#22c55e';
    setTimeout(() => {
        btn.textContent = 'Copy';
        btn.style.color = '';
    }, 2000);
}
