import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token')
  const userToken = localStorage.getItem('auth_token')
  const token = adminToken || userToken
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
