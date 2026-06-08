import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';
import { createClipCard } from '../components/clip-card.js';
import { MOCK_CLIPS, MOCK_FRIENDS } from '../services/clips-data.js';
import { observeAuthState } from './auth.js';

renderSidebar('sidebar-container', 'home');
renderHeader('header-container');

const greeting = document.getElementById('greeting');

const PICKS = MOCK_CLIPS.slice(0, 6);
const FRIEND_ACTIVITY = MOCK_CLIPS.slice(6, 12);

function renderRow(gridId, clips) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    clips.forEach(clip => grid.appendChild(createClipCard(clip)));
}

function renderFriendStrip() {
    const strip = document.getElementById('friendStrip');
    if (!strip) return;
    strip.innerHTML = `<span class="text-xs text-gray-500 mr-1">Active now:</span>` + MOCK_FRIENDS.map(friend => `
        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white border-2 border-[#0d0d0d] ring-1 ring-[#333]"
             style="background:${friend.color}" title="Friend ${friend.initial}">
            ${friend.initial}
        </div>
    `).join('');
}

function renderGreeting(user) {
    const name = user?.displayName?.trim().split(' ')[0] || user?.email?.split('@')[0];
    greeting.innerHTML = name
        ? `Welcome back, <span class="text-yellow-500 italic">${name}</span>.`
        : `Welcome back<span class="text-yellow-500 italic">.</span>`;
}

renderRow('picksGrid', PICKS);
renderRow('friendsGrid', FRIEND_ACTIVITY);
renderFriendStrip();
observeAuthState(renderGreeting);
