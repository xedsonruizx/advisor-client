import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = '/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),
  actions: {
    async register(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post('/auth/register', payload)
        this.user = data
      } catch (e) {
        this.error = 'No se pudo registrar'
      } finally {
        this.loading = false
      }
    },
    async login(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post('/auth/login', payload)
        this.user = data
      } catch (e) {
        this.error = 'Credenciales inválidas'
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await axios.post('/auth/logout')
      this.user = null
    },
    async fetchMe() {
      try {
        const { data } = await axios.get('/auth/me')
        // data will be null if not logged in (status 200), or user object
        this.user = data
      } catch (e) {
        // Fallback just in case
        this.user = null
      }
    }
  }
})
