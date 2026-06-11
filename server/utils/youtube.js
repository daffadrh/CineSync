const PATTERNS = [
    /youtube\.com\/shorts\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
];

export function extractYoutubeVideoId(url) {
    if (!url) return null;
    for (const pattern of PATTERNS) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}