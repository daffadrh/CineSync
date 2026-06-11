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

let apiPromise = null;

export function loadYouTubeIframeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise(resolve => {
        const previous = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previous?.();
            resolve(window.YT);
        };
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    });

    return apiPromise;
}
