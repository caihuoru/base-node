const cachedFiles = ["assets/art/jewelburst_sprites.json","assets/art/jewelburst_sprites.png","assets/art/jewelburst_sprites_02.json","assets/art/jewelburst_sprites_02.png","assets/art/shines_planets.json","assets/art/shines_planets.png","assets/css/app.css","assets/css/facebook.css","assets/css/mralexbold.css","assets/fonts/CURSE_COMPLETE.woff","assets/fonts/curse_complete.fnt","assets/fonts/curse_complete.png","assets/fonts/mralexbold/mralexbold-webfont.eot","assets/fonts/mralexbold/mralexbold-webfont.svg","assets/fonts/mralexbold/mralexbold-webfont.ttf","assets/fonts/mralexbold/mralexbold-webfont.woff","assets/fonts/mralexbold/mralexbold-webfont.woff2","assets/icons/icon-128x128.png","assets/icons/icon-144x144.png","assets/icons/icon-152x152.png","assets/icons/icon-192x192.png","assets/icons/icon-384x384.png","assets/icons/icon-512x512.png","assets/icons/icon-72x72.png","assets/icons/icon-96x96.png","assets/images/bild_small.png","assets/images/google.png","assets/images/ios.png","assets/sounds/arrow.m4a","assets/sounds/arrow.mp3","assets/sounds/arrow.ogg","assets/sounds/arrow_boom.m4a","assets/sounds/arrow_boom.mp3","assets/sounds/arrow_boom.ogg","assets/sounds/awesome_high_1.m4a","assets/sounds/awesome_high_1.mp3","assets/sounds/awesome_high_1.ogg","assets/sounds/awesome_high_2.m4a","assets/sounds/awesome_high_2.mp3","assets/sounds/awesome_high_2.ogg","assets/sounds/awesome_high_3.m4a","assets/sounds/awesome_high_3.mp3","assets/sounds/awesome_high_3.ogg","assets/sounds/bad_move.m4a","assets/sounds/bad_move.mp3","assets/sounds/bad_move.ogg","assets/sounds/burst_mode.m4a","assets/sounds/burst_mode.mp3","assets/sounds/burst_mode.ogg","assets/sounds/click.m4a","assets/sounds/click.mp3","assets/sounds/click.ogg","assets/sounds/complete.m4a","assets/sounds/complete.mp3","assets/sounds/complete.ogg","assets/sounds/defeat.m4a","assets/sounds/defeat.mp3","assets/sounds/defeat.ogg","assets/sounds/explosion1.m4a","assets/sounds/explosion1.mp3","assets/sounds/explosion1.ogg","assets/sounds/explosion2.m4a","assets/sounds/explosion2.mp3","assets/sounds/explosion2.ogg","assets/sounds/from_outer_space_1.m4a","assets/sounds/from_outer_space_1.mp3","assets/sounds/from_outer_space_1.ogg","assets/sounds/from_outer_space_2.m4a","assets/sounds/from_outer_space_2.mp3","assets/sounds/from_outer_space_2.ogg","assets/sounds/from_outer_space_3.m4a","assets/sounds/from_outer_space_3.mp3","assets/sounds/from_outer_space_3.ogg","assets/sounds/game_over.m4a","assets/sounds/game_over.mp3","assets/sounds/game_over.ogg","assets/sounds/go.m4a","assets/sounds/go.mp3","assets/sounds/go.ogg","assets/sounds/good_high_1.m4a","assets/sounds/good_high_1.mp3","assets/sounds/good_high_1.ogg","assets/sounds/good_high_2.m4a","assets/sounds/good_high_2.mp3","assets/sounds/good_high_2.ogg","assets/sounds/good_high_3.m4a","assets/sounds/good_high_3.mp3","assets/sounds/good_high_3.ogg","assets/sounds/great_high_1.m4a","assets/sounds/great_high_1.mp3","assets/sounds/great_high_1.ogg","assets/sounds/great_high_2.m4a","assets/sounds/great_high_2.mp3","assets/sounds/great_high_2.ogg","assets/sounds/great_high_3.m4a","assets/sounds/great_high_3.mp3","assets/sounds/great_high_3.ogg","assets/sounds/jewel_burst.m4a","assets/sounds/jewel_burst.mp3","assets/sounds/jewel_burst.ogg","assets/sounds/jewel_drop3.m4a","assets/sounds/jewel_drop3.mp3","assets/sounds/jewel_drop3.ogg","assets/sounds/level_complete.m4a","assets/sounds/level_complete.mp3","assets/sounds/level_complete.ogg","assets/sounds/match.m4a","assets/sounds/match.mp3","assets/sounds/match.ogg","assets/sounds/match_01.m4a","assets/sounds/match_01.mp3","assets/sounds/match_01.ogg","assets/sounds/match_02.m4a","assets/sounds/match_02.mp3","assets/sounds/match_02.ogg","assets/sounds/match_03.m4a","assets/sounds/match_03.mp3","assets/sounds/match_03.ogg","assets/sounds/match_04.m4a","assets/sounds/match_04.mp3","assets/sounds/match_04.ogg","assets/sounds/match_05.m4a","assets/sounds/match_05.mp3","assets/sounds/match_05.ogg","assets/sounds/mouse_over.m4a","assets/sounds/mouse_over.mp3","assets/sounds/mouse_over.ogg","assets/sounds/music.m4a","assets/sounds/music.mp3","assets/sounds/music.ogg","assets/sounds/nice_high_1.m4a","assets/sounds/nice_high_1.mp3","assets/sounds/nice_high_1.ogg","assets/sounds/nice_high_2.m4a","assets/sounds/nice_high_2.mp3","assets/sounds/nice_high_2.ogg","assets/sounds/nice_high_3.m4a","assets/sounds/nice_high_3.mp3","assets/sounds/nice_high_3.ogg","assets/sounds/remove_block.m4a","assets/sounds/remove_block.mp3","assets/sounds/remove_block.ogg","assets/sounds/spark.m4a","assets/sounds/spark.mp3","assets/sounds/spark.ogg","assets/spine/logo.atlas","assets/spine/logo.json","assets/spine/logo.png","index.html","jewel-burst.min.js","manifest.json","/","https://cdn.fbrq.io/@orange-games/splash/assets/spine/kizi_skeleton.json","https://cdn.jsdelivr.net/npm/@orange-games/phaser-ads@2.2/build/phaser-ads.min.js","https://cdn.jsdelivr.net/npm/@orange-games/phaser-cachebuster@2.0/build/phaser-cachebuster.min.js","https://cdn.jsdelivr.net/npm/@orange-games/phaser-nineslice@2.0/build/phaser-nineslice.min.js","https://cdn.jsdelivr.net/npm/@orange-games/phaser-spine@3.0/build/phaser-spine.min.js","https://cdn.jsdelivr.net/npm/@orange-games/phaser-super-storage@1.0/build/phaser-super-storage.min.js","https://cdn.jsdelivr.net/npm/@orange-games/splash@3.5/build/splash.min.js"];
/**
 * cachedFiles
 * This variable is injected above this comment
 */
const cacheName = 'jewel-burst';

function logger() {
    return;
    let prepend = [new Date().toTimeString().split(" ")[0] + ' [ServiceWorker] '].concat(Array.prototype.slice.call(arguments));
    console.log.apply(console.log, prepend);
}

function addToCache(response, event) {
    // Check if we received a valid response
    if(!response || response.status !== 200 || response.type !== 'basic') {
        return response;
    }

    // IMPORTANT: Clone the response. A response is a stream
    // and because we want the browser to consume the response
    // as well as the cache consuming the response, we need
    // to clone it so we have two streams.
    var responseToCache = response.clone();

    caches.open(cacheName)
        .then((cache) => cache.put(event.request, responseToCache));

    return response;
}

function fetchNetwork(event, request) {
    return fetch(request)
        .then((response) => {
            logger('Fetch: Adding requested url to cache;', request.url);

            return addToCache(response, event);
        });
}

function fetchCache(request, options) {
    return caches.open(cacheName)
        .then((cache) => cache.match(request, options))
        .then((matching) => {
            logger('Fetch: Cache match, returning cache hit (if available :)');

            return matching || Promise.reject('No matching version found!');
        });
}

self.addEventListener('install', (event) => {
    const installPromise = caches.open(cacheName)
        .then((cache) => {
            logger('Install: Cache: ' + cacheName + ' opened, adding:', cachedFiles);
            return cache.addAll(cachedFiles);
        })
        .catch((error) => {
            logger('Install: Unable to open cache: ' + cacheName, error);
        });

    event.waitUntil(installPromise);
});

self.addEventListener('activate', (event) => {
    logger('Activation: deleting old cache');

    const activatePromise = caches.delete(cacheName)
        .catch((e) => {
            logger('Activation error: ', e);
        });

    event.waitUntil(activatePromise);
});

self.addEventListener('fetch', (event) => {
    const isVersion = (event.request.url.indexOf('version.js') !== -1);
    const options =  isVersion ? {ignoreSearch: true} : {} ;
    const request = event.request.clone();
    let fetchPromise;

    logger('Fetch: Fetching asset: ', request.url);

    if (isVersion) {
        fetchPromise = fetchNetwork(event, request)
            .catch(() => {
                logger('Fetch: Failed to fetch from network, trying caches');

                return fetchCache(request, options);
            });
    } else {
        fetchPromise = fetchCache(request, options)
            .catch(() => {
                logger('Fetch: Failed to fetch from cache, trying network');

                return fetchNetwork(event, request);
            });
    }

    event.respondWith(fetchPromise);
});

self.addEventListener('message', (event) => {
    let data = event.data;
    logger('Versioning: data received', data);

    if (data && data.newVersion && data.oldVersion) {
        if (data.oldVersion === data.newVersion) {
            logger('Versioning: Equal versions, no need to update');
            return;
        }

        logger('Versioning: New version found, updating cache');

        const activatePromise = caches.delete(cacheName);

        event.waitUntil(activatePromise);
    }
});
