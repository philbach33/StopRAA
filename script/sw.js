const CACHE_NAME = "simple-cache-v1.0";
const OFFLINE_URL = "index.html"; // Page affichée hors connexion

const url = self.location.href;
const path = url.substring(0, url.lastIndexOf('/'));  // Retirer la partie après le dernier "/"

// Fichiers à mettre en cache
const FILES_TO_CACHE = [
    "index.html",
    "/raa/out/page-form-1.html",
    "/raa/out/page-user.html",
    "/raa/out/page-message.html",
    "/raa/css/styles.css",
    "/raa/css/connexion.css",
    "/raa/css/form-1.css",
    "/raa/css/message.css",
    "/raa/css/user.css",
    "/raa/script/jquery-1.10.2.min.js",
    "/raa/script/jspdf.umd.js",
    "/raa/script/indexedDB.js",
    "/raa/script/common.js",
    "/raa/script/form-1.js", 
    "/raa/script/message.js", 
    "/raa/script/user.js",
    "/raa/assets/icons/wifi.svg" ,
    "/raa/assets/icons/wifi-offline.svg" ,
    "/raa/assets/icons/user-doctor.svg"
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installation");

    // Pré-cache des fichiers
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Mise en cache des fichiers");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activation");

    // Nettoyage des anciens caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("[Service Worker] Suppression du cache ancien:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes réseau
self.addEventListener("fetch", (event) => {
    console.log("[Service Worker] Fetch pour :", event.request.url);

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retourne la réponse du cache ou fait un fetch réseau
            return response || fetch(event.request).catch(() => {
                // Si réseau échoue, retourne la page hors ligne pour les requêtes HTML
                if (event.request.headers.get("accept").includes("text/html")) {
                    return caches.match(OFFLINE_URL);
                }
            });
        })
    );
});