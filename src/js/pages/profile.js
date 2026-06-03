import { renderSidebar } from '../components/sidebar.js';
import { renderHeader } from '../components/header.js';

renderSidebar('sidebar-container', 'profile');
renderHeader('header-container');

const searchWrapper = document.getElementById('searchInput')?.parentElement;
if (searchWrapper) {
    searchWrapper.remove();
    const avatar = document.querySelector('#header-container [onclick]');
    if (avatar) avatar.style.marginLeft = 'auto';
}

const MOCK_PROFILE = {
    displayName: 'Display Name',
    username: 'username',
    email: 'email@mail.com',
};

const MOCK_FRIENDS_LIST = [
    { name: 'Jane Doe', watching: 'Jujutsu Kaisen - Season 1', online: true },
    { name: 'Adam Smith', watching: 'Jujutsu Kaisen - Season 1', online: false },
];

const MOCK_RECS = [
    {
        from: 'Farhan', fromInitial: 'F', fromColor: '#7c3aed',
        timeAgo: '2d ago', online: false,
        title: 'Sekawan Limo',
        note: '"lucu bgt sumpah"',
        coverGrad: 'linear-gradient(135deg,#2d6a4f,#1b4332)',
        genres: 'Drama · Horror · Comedy',
    },
    {
        from: 'riei2', fromInitial: 'R', fromColor: '#0891b2',
        timeAgo: '2d ago', online: false,
        title: 'My Hero Academia - Season 1',
        note: '"lumayan la"',
        coverGrad: 'linear-gradient(135deg,#0369a1,#075985)',
        genres: 'Anime · Action · Supernatural',
    },
];

const FRIEND_AVATARS = [
    { initial: 'A', color: '#c0392b', name: 'Abdul' },
    { initial: 'B', color: '#16a34a', name: 'Budi' },
    { initial: 'C', color: '#7c3aed', name: 'Cici' },
    { initial: 'D', color: '#d97706', name: 'Dani' },
];

// --- Render profile info ---
document.getElementById('profileDisplayName').textContent = MOCK_PROFILE.displayName;
document.getElementById('profileUsername').textContent = MOCK_PROFILE.username;
document.getElementById('profileEmail').textContent = MOCK_PROFILE.email;

// --- Render friends list ---
const friendsList = document.getElementById('friendsList');
MOCK_FRIENDS_LIST.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = `flex items-center gap-3 py-3.5 ${i < MOCK_FRIENDS_LIST.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`;
    div.innerHTML = `
        <div class="relative w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-user text-gray-400 text-sm"></i>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#141414] ${f.online ? 'bg-green-500' : 'bg-gray-500'}"></span>
        </div>
        <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white">${f.name}</p>
            <p class="text-xs text-gray-500 truncate">Currently watching ${f.watching}</p>
        </div>
    `;
    friendsList.appendChild(div);
});

// --- Render recommendations list ---
const recsList = document.getElementById('recsList');
MOCK_RECS.forEach(rec => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-3';
    div.innerHTML = `
        <div class="w-12 h-[72px] rounded-lg flex-shrink-0" style="background:${rec.coverGrad};"></div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-1">
                <span class="w-2 h-2 rounded-full flex-shrink-0 ${rec.online ? 'bg-green-500' : 'bg-gray-500'}"></span>
                <span class="text-xs text-gray-400 font-medium">${rec.from}</span>
                <span class="text-xs text-gray-600">· ${rec.timeAgo}</span>
            </div>
            <p class="text-sm font-semibold text-white leading-tight truncate">${rec.title}</p>
            <p class="text-xs text-gray-500 truncate">${rec.note}</p>
        </div>
        <button class="rec-add-btn px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333]
                       text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                data-title="${rec.title}"
                data-genres="${rec.genres}">
            Add
        </button>
    `;
    recsList.appendChild(div);
});

// --- Render friend avatars in Recommend popup ---
const recommendFriends = document.getElementById('recommendFriends');
FRIEND_AVATARS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'friend-rec-btn flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer group';
    btn.dataset.name = f.name;
    btn.dataset.selected = 'false';
    btn.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
                    transition-all ring-2 ring-transparent group-hover:ring-yellow-500/60"
             style="background:${f.color};">${f.initial}</div>
        <span class="text-[10px] text-gray-400 group-hover:text-white transition-colors">${f.name}</span>
    `;
    btn.addEventListener('click', () => {
        const isSelected = btn.dataset.selected === 'true';
        btn.dataset.selected = isSelected ? 'false' : 'true';
        const ring = btn.querySelector('div');
        ring.classList.toggle('ring-yellow-500', !isSelected);
        ring.classList.toggle('ring-transparent', isSelected);
        ring.classList.toggle('group-hover:ring-yellow-500/60', isSelected);
    });
    recommendFriends.appendChild(btn);
});

// --- Add Friend Popup ---
const addFriendOverlay = document.getElementById('addFriendOverlay');

function openAddFriend() {
    addFriendOverlay.classList.remove('opacity-0', 'pointer-events-none');
    addFriendOverlay.classList.add('opacity-100');
    document.getElementById('addFriendInput').value = '';
    document.getElementById('addFriendInput').focus();
}

function closeAddFriend() {
    addFriendOverlay.classList.add('opacity-0', 'pointer-events-none');
    addFriendOverlay.classList.remove('opacity-100');
}

document.getElementById('addFriendBtn').addEventListener('click', openAddFriend);
document.getElementById('addFriendCancelBtn').addEventListener('click', closeAddFriend);
document.getElementById('addFriendBackdrop').addEventListener('click', closeAddFriend);
document.getElementById('addFriendConfirmBtn').addEventListener('click', () => {
    const name = document.getElementById('addFriendInput').value.trim();
    if (name) closeAddFriend();
});

// --- Recommend This Popup ---
const recommendOverlay = document.getElementById('recommendOverlay');

function openRecommend(title, genres) {
    document.getElementById('recommendTitle').textContent = title;
    document.getElementById('recommendGenres').textContent = genres;
    document.getElementById('recommendNote').value = '';
    document.querySelectorAll('.friend-rec-btn').forEach(btn => {
        btn.dataset.selected = 'false';
        const ring = btn.querySelector('div');
        ring.classList.remove('ring-yellow-500');
        ring.classList.add('ring-transparent');
    });
    recommendOverlay.classList.remove('opacity-0', 'pointer-events-none');
    recommendOverlay.classList.add('opacity-100');
}

function closeRecommend() {
    recommendOverlay.classList.add('opacity-0', 'pointer-events-none');
    recommendOverlay.classList.remove('opacity-100');
}

recsList.addEventListener('click', e => {
    const btn = e.target.closest('.rec-add-btn');
    if (btn) openRecommend(btn.dataset.title, btn.dataset.genres);
});

document.getElementById('recommendCancelBtn').addEventListener('click', closeRecommend);
document.getElementById('recommendBackdrop').addEventListener('click', closeRecommend);
document.getElementById('recommendShareBtn').addEventListener('click', () => {
    closeRecommend();
});

// --- Edit Profile Popup ---
const editProfileOverlay = document.getElementById('editProfileOverlay');

function openEditProfile() {
    document.getElementById('editDisplayName').value = MOCK_PROFILE.displayName;
    document.getElementById('editUsername').value = MOCK_PROFILE.username;
    editProfileOverlay.classList.remove('opacity-0', 'pointer-events-none');
    editProfileOverlay.classList.add('opacity-100');
}

function closeEditProfile() {
    editProfileOverlay.classList.add('opacity-0', 'pointer-events-none');
    editProfileOverlay.classList.remove('opacity-100');
}

document.getElementById('editProfileBtn').addEventListener('click', openEditProfile);
document.getElementById('editProfileCancelBtn').addEventListener('click', closeEditProfile);
document.getElementById('editProfileBackdrop').addEventListener('click', closeEditProfile);
document.getElementById('editProfileSaveBtn').addEventListener('click', () => {
    const newName = document.getElementById('editDisplayName').value.trim();
    const newUsername = document.getElementById('editUsername').value.trim();
    if (newName) {
        MOCK_PROFILE.displayName = newName;
        document.getElementById('profileDisplayName').textContent = newName;
    }
    if (newUsername) {
        MOCK_PROFILE.username = newUsername;
        document.getElementById('profileUsername').textContent = newUsername;
    }
    closeEditProfile();
});

// --- Global ESC key handler ---
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeAddFriend();
        closeRecommend();
        closeEditProfile();
    }
});
