/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyCtgVY592K-FFmPwEnANikRj5M1FEgKbxg",
  authDomain: "nexit-solution-crm-system.firebaseapp.com",
  projectId: "nexit-solution-crm-system",
  storageBucket: "nexit-solution-crm-system.firebasestorage.app",
  messagingSenderId: "279723645571",
  appId: "1:279723645571:web:ad3e44fe5d70e804e199b6"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/'
  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === link && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(link)
      }
    })
  )
})