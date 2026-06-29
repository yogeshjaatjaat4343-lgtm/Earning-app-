// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCl2Zut4rcT11Z_sTOUcY6-62AzxaCbAp4",
    authDomain: "earningapp-f5159.firebaseapp.com",
    projectId: "earningapp-f5159",
    storageBucket: "earningapp-f5159.firebasestorage.app",
    messagingSenderId: "12919105584",
    appId: "1:12919105584:web:1e2602778c926d426625f5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('📩 Background Message:', payload);
    const notificationTitle = payload.notification?.title || 'ELITE EARNING';
    const notificationOptions = {
        body: payload.notification?.body || '🎮 कुछ नया है!',
        icon: 'https://i.ibb.co/BH93HZzP/file-00000000b05c720688b1dbdc9dd1d551.png',
        badge: 'https://i.ibb.co/BH93HZzP/file-00000000b05c720688b1dbdc9dd1d551.png',
        vibrate: [200, 100, 200],
        data: payload.data || {}
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});