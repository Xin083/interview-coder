import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  id: string
  email: string
  subscriptionStatus: 'pro' | 'test'
  isAuthenticated: boolean
  freeTrialUsageCount: number
  setAuth: (auth: { id: string; email: string; subscriptionStatus: 'pro' | 'test' }) => void
  clearAuth: () => void
  incrementFreeTrialUsage: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      id: '',
      email: '',
      subscriptionStatus: 'test',
      isAuthenticated: false,
      freeTrialUsageCount: 0,
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
      }),
      incrementFreeTrialUsage: () => set((state) => ({
        freeTrialUsageCount: state.freeTrialUsageCount + 1
      }))
    }),
    {
      name: 'auth-storage',
    }
  )
) 