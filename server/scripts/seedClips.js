import { adminDb } from '../firebase-admin.js';
import { CLIPS_SEED_DATA } from './clips-seed-data.js';

// Matches MOCK_WATCHLIST's movieIds, so the "From Watchlist" filter
// has real overlap to test against once seeded.
const TMDB_IDS = {
    'Breaking Bad': 1396,
    'Better Call Saul': 1405,
    'The Wire': 1438,
    'Futurama': 1668,
    'Game of Thrones': 1399,
};

async function seedComment(clipRef, comment, parentId) {
    const ref = await clipRef.collection('comments').add({
        authorId: null,
        authorName: comment.user,
        authorInitials: comment.initials,
        text: comment.text,
        parentId,
        createdAt: new Date().toISOString(),
    });

    for (const reply of comment.replies ?? []) {
        await seedComment(clipRef, reply, ref.id);
    }
}

async function seed() {
    for (const [index, mock] of CLIPS_SEED_DATA.entries()) {
        const clipRef = adminDb.collection('clips').doc(mock.id);

        await clipRef.set({
            authorId: null,
            tags: mock.tags,
            caption: mock.caption,
            youtubeUrl: mock.youtubeUrl,
            gradientClass: mock.gradientClass,
            show: { ...mock.show, tmdbId: TMDB_IDS[mock.show.name] ?? null },
            commentCount: mock.commentCount,
            saveCount: 0,
            createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        });

        for (const comment of mock.comments) {
            await seedComment(clipRef, comment, null);
        }

        console.log(`Seeded ${mock.id}`);
    }
}

seed()
    .then(() => {
        console.log('Done seeding clips.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });