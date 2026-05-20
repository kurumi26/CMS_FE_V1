import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import api from '../services/api'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true })
        try {
          const res = await api.post('/auth/login', { email, password })
          const { user, token } = res.data
          localStorage.setItem('jay_token', token)
          set({ user, token, loading: false })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      register: async (name, email, password, password_confirmation) => {
        set({ loading: true })
        try {
          const res = await api.post('/auth/register', { name, email, password, password_confirmation })
          const { user, token } = res.data
          localStorage.setItem('jay_token', token)
          set({ user, token, loading: false })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {}
        localStorage.removeItem('jay_token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me')
          set({ user: res.data })
        } catch {
          set({ user: null, token: null })
          localStorage.removeItem('jay_token')
        }
      },

      updateProfile: async (data) => {
        const res = await api.put('/auth/me', data)
        set({ user: res.data })
      },
    }),
    { name: 'jay_auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
