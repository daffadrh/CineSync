import { renderSidebar }             from '../components/sidebar.js';
import { renderHeader }              from '../components/header.js';
import { renderSharePopup, openSharePopup } from '../components/share-popup.js';
import { renderSavedToast, showSavedToast } from '../components/saved-toast.js';
import { MOCK_CLIPS }                from '../services/clips-data.js';

// ─── Bootstrap shared layout ──────────────────────────────────────────────────
renderSidebar('sidebar-container', 'trending-clips');
renderHeader('header-container');
renderSharePopup('share-popup-container');
renderSavedToast('toast-container');

// ─── Inject gradient CSS ──────────────────────────────────────────────────────
(function injectGradients() {
    if (document.getElementById('clipGradStyles')) return;
    const s = document.createElement('style');
    s.id = 'clipGradStyles';
    s.textContent = `
        :root {
            --viewer-height: min(80dvh, 800px);
        }

        .clip-grad-1  { background:linear-gradient(160deg,#3a2a1a 0%,#c8922a 100%); }
        .clip-grad-2  { background:linear-gradient(160deg,#1a2a3a 0%,#2a8ac8 100%); }
        .clip-grad-3  { background:linear-gradient(160deg,#2a1a3a 0%,#8a2ac8 100%); }
        .clip-grad-4  { background:linear-gradient(160deg,#1a3a2a 0%,#2ac88a  80%); }
        .clip-grad-5  { background:linear-gradient(160deg,#3a1a2a 0%,#c82a6a 100%); }
        .clip-grad-6  { background:linear-gradient(160deg,#2a2a1a 0%,#c8c02a 100%); }
        .clip-grad-7  { background:linear-gradient(160deg,#1a3a3a 0%,#2ac8c0 100%); }
        .clip-grad-8  { background:linear-gradient(160deg,#3a2a2a 0%,#c84a2a 100%); }
        .clip-grad-9  { background:linear-gradient(160deg,#2a1a1a 0%,#c8402a 100%); }
        .clip-grad-10 { background:linear-gradient(160deg,#1a2a1a 0%,#4ac82a  80%); }

        .clips-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
        }

        #sidePanel   { transition: width .3s ease, opacity .3s ease; box-sizing: border-box; border-radius: 20px; }
        /* Unified height and responsive layout using CSS variables */
        #viewerShell, #sidePanel, #clipMain, #actionRail { height: var(--viewer-height); }
        #viewerShell { margin-top: 20px; gap: 12px; }
        #clipMain    { aspect-ratio: 9 / 16; border-radius: 20px; overflow: hidden; max-height: inherit; }
        #actionRail  { border-radius: 20px; }
        .action-icon { transition: background .2s, border-color .2s, color .2s; }

        /* Share Popup Enhancements */

        /* Comments Panel Layout */
        .comments-panel { height: 100%; display: flex; flex-direction: column; }
        .comments-header { flex-shrink: 0; padding: 24px 28px; border-bottom: 1px solid #2a2a2a; background: #141414; }
        .comments-list { flex: 1; overflow-y: auto; padding: 20px 28px; }
        .comments-input { flex-shrink: 0; padding: 16px 28px 24px; border-top: 1px solid #2a2a2a; background: #141414; }
    `;
    document.head.appendChild(s);
})();

// ─── State ────────────────────────────────────────────────────────────────────
let currentIndex = 0;   // index into MOCK_CLIPS
let activePanel  = null; // 'info' | 'comments' | null
const savedSet   = new Set();

// ─── Read clip from URL ───────────────────────────────────────────────────────
function getClipIndexFromURL() {
    const id = new URLSearchParams(window.location.search).get('id');
    const idx = MOCK_CLIPS.findIndex(c => c.id === id);
    return idx >= 0 ? idx : 0;
}

// ─── Load a clip by index ─────────────────────────────────────────────────────
function loadClip(index, pushState = true) {
    currentIndex = ((index % MOCK_CLIPS.length) + MOCK_CLIPS.length) % MOCK_CLIPS.length;
    const clip = MOCK_CLIPS[currentIndex];

    // Update URL without reload
    if (pushState) {
        history.pushState({ id: clip.id }, '', `clip-viewer.html?id=${clip.id}`);
    }
    document.title = `CineSync - ${clip.show.name}`;

    // Populate clip visuals
    document.getElementById('clipThumb').className    = `absolute inset-0 w-full h-full ${clip.gradientClass}`;

    const overlay = document.getElementById('clipCaptionOverlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="space-y-2">
                <div class="flex flex-wrap gap-1">
                    ${clip.tags.map(tag => `
                        <span class="text-xs text-yellow-400">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
                <p class="text-white text-sm leading-relaxed line-clamp-2" title="${clip.caption}">
                    ${clip.caption}
                </p>
            </div>
        `;
    }

    document.getElementById('commentCountLabel').textContent = clip.commentCount ?? 0;

    // Reset panel and active states
    closePanelImmediate();
    syncSaveIcon();
}

// ─── Side panel ───────────────────────────────────────────────────────────────
function togglePanel(type) {
    if (activePanel === type) { closePanel(); return; }
    activePanel = type;
    openPanel(type);
}

function openPanel(type) {
    const panel = document.getElementById('sidePanel');
    const main  = document.getElementById('clipMain');
    const clip  = MOCK_CLIPS[currentIndex];

    const content = type === 'info' ? buildInfoHTML(clip) : buildCommentsHTML(clip);
    panel.innerHTML = content;
    panel.style.width    = '300px';
    panel.style.opacity  = '1';
    panel.style.display  = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.overflow = 'hidden';
    setActiveBtn(type);
}

function closePanel() {
    _applyClosePanel(false);
    activePanel = null;
    setActiveBtn(null);
}

function closePanelImmediate() {
    const panel = document.getElementById('sidePanel');
    if (!panel) return;
    panel.style.transition = 'none';
    _applyClosePanel(true);
    requestAnimationFrame(() => { panel.style.transition = ''; });
    activePanel = null;
    setActiveBtn(null);
}

function _applyClosePanel(immediate) {
    const panel = document.getElementById('sidePanel');
    const main  = document.getElementById('clipMain');
    if (!panel || !main) return;
    if (immediate) panel.style.transition = 'none';
    panel.style.width    = '0';
    panel.style.opacity  = '0';
    panel.style.overflow = 'hidden';
}

function setActiveBtn(active) {
    document.querySelectorAll('[data-action]').forEach(btn => {
        const icon = btn.querySelector('.action-icon');
        if (!icon) return;
        const on = btn.dataset.action === active;
        icon.style.background  = on ? 'rgba(234,179,8,0.15)' : '';
        icon.style.borderColor = on ? 'rgba(234,179,8,0.4)'  : '';
        icon.style.color       = on ? '#eab308' : '';
    });
}

// ─── Save ─────────────────────────────────────────────────────────────────────
function handleSave() {
    const clip = MOCK_CLIPS[currentIndex];
    if (savedSet.has(clip.id)) {
        savedSet.delete(clip.id);
    } else {
        savedSet.add(clip.id);
        showSavedToast();
    }
    syncSaveIcon();
}

function syncSaveIcon() {
    const clip  = MOCK_CLIPS[currentIndex];
    const saved = savedSet.has(clip.id);
    const icon  = document.getElementById('saveIcon');
    const btn   = document.querySelector('[data-action="save"] .action-icon');
    if (icon) icon.className = saved
        ? 'fa-solid fa-bookmark pointer-events-none'
        : 'fa-regular fa-bookmark pointer-events-none';
    if (btn) {
        btn.style.background  = saved ? 'rgba(234,179,8,0.15)' : '';
        btn.style.borderColor = saved ? 'rgba(234,179,8,0.4)'  : '';
        btn.style.color       = saved ? '#eab308' : '';
    }
}

// ─── Action rail events ───────────────────────────────────────────────────────
document.getElementById('actionRail').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'info')     togglePanel('info');
    if (action === 'comments') togglePanel('comments');
    if (action === 'share')    openSharePopup(MOCK_CLIPS[currentIndex]);
    if (action === 'save')     handleSave();
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') loadClip(currentIndex + 1);
    if (e.key === 'ArrowUp')   loadClip(currentIndex - 1);
});

// ─── Browser back/forward ─────────────────────────────────────────────────────
window.addEventListener('popstate', () => {
    loadClip(getClipIndexFromURL(), false);
});

// ─── Info panel HTML ──────────────────────────────────────────────────────────
function buildInfoHTML(clip) {
    const genres = Array.isArray(clip.show.genres)
        ? clip.show.genres.join(' • ')
        : clip.show.genres;

    return `<div class="comments-list" style="padding: 32px 28px; height: 100%;">
        <!-- SOURCE -->

        <div class="mb-6">
            <p class="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-2">
                Source
            </p>

            <h2 class="font-serif text-2xl font-semibold text-yellow-500 mb-2">
                ${clip.show.name}
            </h2>

            <div class="
                inline-flex
                items-center
                gap-2
                bg-yellow-500/10
                border
                border-yellow-500/20
                text-yellow-400
                text-sm
                font-medium
                px-3
                py-1.5
                rounded-full
            ">
                <i class="fa-solid fa-star text-xs"></i>
                ${clip.show.rating}
            </div>

            <p class="text-xs text-gray-500 mt-3">
                ${genres}
            </p>
        </div>

        <div class="h-px bg-[#2a2a2a] mb-6"></div>

        <!-- ABOUT -->

        <div class="mb-6">
            <p class="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">
                About
            </p>

            <p class="text-sm text-gray-400 leading-relaxed">
                ${clip.show.description}
            </p>
        </div>

        <div class="h-px bg-[#2a2a2a] mb-6"></div>

        <!-- CLIP DETAILS -->

        <div class="mb-6">
            <p class="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">
                Clip
            </p>

            <div class="flex flex-wrap gap-2 mb-3">
                ${(clip.tags || []).map(tag => `
                    <span class="
                        text-xs
                        text-yellow-400
                        bg-yellow-500/10
                        px-2.5
                        py-1
                        rounded-full
                    ">
                        ${tag}
                    </span>
                `).join('')}
            </div>

            <p class="text-sm text-gray-400 leading-relaxed">
                ${clip.caption}
            </p>
        </div>

        <div class="h-px bg-[#2a2a2a] mb-6"></div>

        <!-- LINKS -->

        <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-gray-600 mb-3">
                External Links
            </p>

            <a href="${clip.youtubeUrl}"
               target="_blank"
               class="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    text-gray-400
                    hover:text-white
                    transition-colors
               ">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                View original clip
            </a>
        </div>
    </div>`;
}

// ─── Comments panel HTML ──────────────────────────────────────────────────────
function buildCommentsHTML(clip) {
    const comments = clip.comments ?? [];

    const commentHTML = (c, isReply = false) => `
        <div class="flex gap-2.5 ${isReply ? 'ml-9 mt-3' : 'mb-5'}">
            <div class="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center
                        text-xs font-semibold text-gray-400 flex-shrink-0 mt-0.5">
                ${c.initials}
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-300 mb-0.5">${c.user}</p>
                <p class="text-sm text-gray-400 leading-snug">${c.text}</p>
                ${c.replyCount ? `<button class="text-[11px] text-gray-600 hover:text-gray-400 transition-colors mt-1.5 bg-transparent border-none cursor-pointer p-0">∨ ${c.replyCount} Reply</button>` : ''}
                ${(c.replies || []).map(r => commentHTML(r, true)).join('')}
            </div>
        </div>
    `;

    return `
        <div class="comments-panel">
            <div class="comments-header">
                <h2 class="text-xl font-bold text-white">Comments</h2>
            </div>

            <div class="comments-list">
                ${comments.length
                    ? comments.map(c => commentHTML(c)).join('')
                    : '<p class="text-sm text-gray-600 italic">No comments yet.</p>'
                }
            </div>

            <div class="comments-input">
                <div class="flex gap-3">
                    <div class="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                        ME
                    </div>
                    <div class="flex-1">
                        <textarea placeholder="Add a comment..." 
                                  class="w-full bg-[#1a1a1a] border border-[#333] rounded-lg text-white p-3 text-sm outline-none focus:border-yellow-500 transition-colors resize-none h-20 block"></textarea>
                        <div class="flex justify-end mt-2">
                            <button class="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-1.5 rounded-full text-xs font-bold transition-colors">
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
loadClip(getClipIndexFromURL(), false);
