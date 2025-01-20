const SW_VERSION = "v1.5.90";
const CACHE_NAME = "raa-cache-" + SW_VERSION;
const OFFLINE_URL = "index.html"; // Page affichée hors connexion

const url = self.location.href;
const path = url.substring(0, url.lastIndexOf('/'));  // Retirer la partie après le dernier "/"

// Fichiers à mettre en cache
const FILES_TO_CACHE = [
	"manifest.json",
    "index.html",
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "icon-192x192.png",    
    "icon-512x512.png",
    "messages.json",
    "/raa/out/page-form-1.html",
    "/raa/out/page-user.html",
    "/raa/out/page-message.html",
    "/raa/out/page-connexion.html",
    "/raa/out/page-register.html",
    "/raa/css/styles.css",
    "/raa/css/connexion.css",
    "/raa/css/register.css",
    "/raa/css/form.css",
    "/raa/css/portail.css",
    "/raa/css/message.css",
    "/raa/css/user.css",
    "/raa/script/bcrypt.min.js",
    "/raa/script/jquery-1.10.2.min.js",
    "/raa/script/jspdf.umd.js",
    "/raa/script/html2canvas.min.js",
    "/raa/script/indexedDB.js",
    "/raa/script/portail.js",
    "/raa/script/common.js",
    "/raa/script/connexion.js",
    "/raa/script/register.js",
    "/raa/script/form-1.js", 
    "/raa/script/message.js", 
    "/raa/script/user.js",
    "/raa/assets/icons/wifi.svg",
    "/raa/assets/icons/wifi-offline.svg",
    "/raa/assets/icons/user-doctor.svg"
];

const isDevMode = location.hostname === 'localhost'; // ou utilisez un flag
//const isDevMode = false;

if (!isDevMode) {

	// Installation du Service Worker
	self.addEventListener('install', (event) => {
	    console.log('[Service Worker] Installation');
	    event.waitUntil(
	        caches.open(CACHE_NAME).then((cache) => {
	            console.log('[Service Worker] Mise en cache des fichiers...');
	            return cache.addAll(FILES_TO_CACHE);
	        }).catch((err) => console.error('[Service Worker] Erreur pendant le pré-caching:', err))
	    );
	});

	self.addEventListener('activate', (event) => {
	    console.log('[Service Worker] Activation');

	    event.waitUntil(
	        caches.keys().then((cacheNames) => {
	            return Promise.all(
	                cacheNames.map((cacheName) => {
	                    if (cacheName !== CACHE_NAME) {
	                        console.log('[Service Worker] Suppression du cache obsolète :', cacheName);
	                        return caches.delete(cacheName);
	                    }
	                })
	            );
	        }).then(() => {
	            // S'assurer que le SW contrôle immédiatement les clients existants
	            return self.clients.claim();
	        }).then(() => {
	            // Envoyer la version du Service Worker à tous les clients
	            return self.clients.matchAll().then((clients) => {
	                clients.forEach((client) => {
	                    client.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
	                	console.log('[Service Worker] Message SW_VERSION envoyé :', SW_VERSION);                    
	                });
	            });
	        }).catch((error) => {
	            console.error('[Service Worker] Erreur pendant l\'activation :', error);
	        })
	    );
	});

	self.addEventListener('message', (event) => {
		console.log ('[service worker] message', event);
	    if (event.data === 'SKIP_WAITING') {
	        self.skipWaiting();
	    }
	});

	self.addEventListener("fetch", (event) => {
	    console.log("[Service Worker] Fetch pour :", event.request.url);

	    const urlWithoutQuery = event.request.url.split("?")[0]; // Supprimer les paramètres

	    event.respondWith (
	        caches.match (urlWithoutQuery).then((cachedResponse) => {
	            // Si une réponse est trouvée dans le cache, elle est renvoyée.
	            if (cachedResponse) {
	                console.log("[Service Worker] Ressource trouvée dans le cache :", event.request.url);
	                return cachedResponse;
	            }

	            // Sinon, une requête réseau est effectuée.
	            return fetch(event.request)
	                .then((networkResponse) => {
	                    // Si la requête réseau réussit, elle est mise en cache.
	                    return caches.open(CACHE_NAME).then((cache) => {
	                        // Ne mettez pas en cache les requêtes non sécurisées ou non GET.
	                        if (event.request.method === "GET" && event.request.url.startsWith(self.origin)) {
	                            cache.put(urlWithoutQuery, networkResponse.clone());
	                        }
	                        return networkResponse;
	                    });
	                })
	                .catch(() => {
	                    // Si la requête échoue (hors ligne), renvoyer une page d'erreur ou une ressource par défaut.
	                    if (event.request.headers.get("accept")?.includes("text/html")) {
	                        return caches.match(OFFLINE_URL);
	                    }
	                });
	        })
	    );
	});

}