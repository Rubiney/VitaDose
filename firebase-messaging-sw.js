importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyDB80c9ambFWPz8qwO5fP8AZ4oNKS3imjg",
  authDomain:        "vitadose-d5522.firebaseapp.com",
  projectId:         "vitadose-d5522",
  storageBucket:     "vitadose-d5522.firebasestorage.app",
  messagingSenderId: "695847450957",
  appId:             "1:695847450957:web:5ad11988f77c92dcec5f04"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification ?? {};
  self.registration.showNotification(title ?? '💊 VitaDose', {
    body:    body ?? '',
    icon:    '/icons/icon-192.svg',
    badge:   '/icons/icon-192.svg',
    tag:     payload.data?.tag ?? 'vd-dose',
    silent:  false,
    vibrate: [200, 100, 200],
  });
});
