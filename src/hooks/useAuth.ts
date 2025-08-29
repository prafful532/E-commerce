import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin'
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me').then(r => {
      setUser(r.data.user)
    }).catch(() => {
      localStorage.removeItem('auth_token')
    }).finally(() => setLoading(false))
  }, [])

  const signUp = async (email: string, password: string, fullName: string, role: 'user' | 'admin' = 'user') => {
    try {
      setLoading(true)
      const { data } = await api.post('/auth/signup', { email, password, full_name: fullName, role })
      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      toast.success('Account created successfully!')
      return true
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Sign up failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      toast.success('Signed in successfully!')
      return true
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Sign in failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    toast.success('Signed out successfully!')
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return false
      await api.patch(`/profiles/${user.id}`, updates)
      const me = await api.get('/auth/me')
      setUser(me.data.user)
      toast.success('Profile updated successfully!')
      return true
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update profile')
      return false
    }
  }

  return { user, loading, signUp, signIn, signOut, updateProfile }
}
