import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  id: string
  email: string
  subscriptionStatus: 'pro' | 'test'
  isAuthenticated: boolean
  setAuth: (auth: { id: string; email: string; subscriptionStatus: 'pro' | 'test' }) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      id: '',
      email: '',
      subscriptionStatus: 'test',
      isAuthenticated: false,
      setAuth: (auth) => set({
        id: auth.id,
        email: auth.email,
        subscriptionStatus: auth.subscriptionStatus,
        isAuthenticated: true
      }),
      clearAuth: () => set({
        id: '',
        email: '',
        subscriptionStatus: 'test',
        isAuthenticated: false
      })
    }),
    {
      name: 'auth-storage',
    }
  )
) 