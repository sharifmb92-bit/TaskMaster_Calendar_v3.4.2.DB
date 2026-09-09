// medbasha
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const CACHE_NAME = 'taskmaster-v3.4.2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js'
];

firebase.initializeApp({
  apiKey: "AIzaSyC7b6_T0ze2HgXiYHfvUeL12JSXE7ZKogc",
  authDomain: "misturnos-fe3ea.firebaseapp.com",
  databaseURL: "https://misturnos-fe3ea-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "misturnos-fe3ea",
  storageBucket: "misturnos-fe3ea.firebasestorage.app",
  messagingSenderId: "1029095925443",
  appId: "1:1029095925443:web:873240d85ac5160f392476"
});

const messaging = firebase.messaging();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification ? payload.notification.title : 'TaskMaster Alerta';
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : 'Tienes una tarea programada.',
    icon: './icon.svg',
    badge: './icon.svg',
    vibrate: [300, 100, 300, 100, 500],
    requireInteraction: true,
    renotify: true,
    tag: 'fcm_alarm_' + Date.now()
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./');
    })
  );
});
