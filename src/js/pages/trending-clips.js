import { renderSidebar }  from '../components/sidebar.js';
import { renderHeader }   from '../components/header.js';
import { createClipCard } from '../components/clip-card.js';
import { MOCK_CLIPS }     from '../services/clips-data.js';

renderSidebar('sidebar-container', 'trending-clips');
renderHeader('header-container');

const SECTIONS = [
    { gridId: 'newClipsGrid',       clips: MOCK_CLIPS.slice(0, 5)   },
    { gridId: 'areaClipsGrid',      clips: MOCK_CLIPS.slice(5, 10)  },
    { gridId: 'nostalgicClipsGrid', clips: MOCK_CLIPS.slice(10, 15) },
];

SECTIONS.forEach(({ gridId, clips }) => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    clips.forEach(clip => grid.appendChild(createClipCard(clip)));
});
