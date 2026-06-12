import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyCtgVY592K-FFmPwEnANikRj5M1FEgKbxg",
  authDomain: "nexit-solution-crm-system.firebaseapp.com",
  projectId: "nexit-solution-crm-system",
  storageBucket: "nexit-solution-crm-system.firebasestorage.app",
  messagingSenderId: "279723645571",
  appId: "1:279723645571:web:ad3e44fe5d70e804e199b6"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BDlmzeewTRCH7ebQtzhHA-jzqbjh-3BvEgZzHcsjK1gk_dekmajqs8n-s0KjluDDZqTqotOCaOscowkC9bJk9bE'
      })
      return token
    }
    return null
  } catch (error) {
    console.error('Failed to get FCM token:', error)
    return null
  }
}

export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
}

export default messaging