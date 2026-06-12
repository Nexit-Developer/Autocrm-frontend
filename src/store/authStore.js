import { create } from 'zustand'
import API from '../api/axios'
import { requestNotificationPermission } from '../firebase'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  login: async (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })

    // Request push notification permission and save token
    try {
      const fcmToken = await requestNotificationPermission()
      if (fcmToken) {
        await API.post('/auth/fcm-token', { fcmToken })
      }
    } catch (err) {
      console.error('FCM setup failed:', err)
    }
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore