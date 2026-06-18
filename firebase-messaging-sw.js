importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "SUBSTITUIR_API_KEY",
  authDomain:        "SUBSTITUIR_PROJECT_ID.firebaseapp.com",
  projectId:         "SUBSTITUIR_PROJECT_ID",
  storageBucket:     "SUBSTITUIR_PROJECT_ID.appspot.com",
  messagingSenderId: "SUBSTITUIR_SENDER_ID",
  appId:             "SUBSTITUIR_APP_ID"
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
