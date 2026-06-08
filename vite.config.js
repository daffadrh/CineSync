import { defineConfig } from 'vite';

const routes = {
    '/':            '/pages/index.html',
    '/home':        '/pages/index.html',
    '/discover':    '/pages/discover.html',
    '/clips':       '/pages/trending-clips.html',
    '/clip':        '/pages/clip-viewer.html',
    '/watchlist':   '/pages/watchlist.html',
    '/profile':     '/pages/profile.html',
    '/friend-recs': '/pages/friend-recs.html',
    '/login':       '/pages/login.html',
    '/register':    '/pages/register.html',
};

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    plugins: [{
        name: 'clean-routes',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const [path, query] = req.url.split('?');
                if (routes[path]) {
                    req.url = routes[path] + (query ? `?${query}` : '');
                }
                next();
            });
        },
    }],
});
