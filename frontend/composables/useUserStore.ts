import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as any,
    users: [] as any[],
    loading: false,
    error: null as string | null,
    token: null as string | null,
  }),
  actions: {
    // Auth endpoints
    async signUp(login: string, password: string, username: string, referralCode?: string) {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const data = await $fetch(`${config.public.apiBase}/auth/sign-up`, {
          method: 'POST',
          body: { login, password, username, referralCode }
        })
        this.error = null
        return data
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async login(login: string, password: string) {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const data: any = await $fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { login, password }
        })
        this.token = data.token
        localStorage.setItem('authToken', data.token)
        this.error = null
        return data
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('authToken')
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      } catch (err: any) {
        console.error('Logout error:', err)
      } finally {
        this.currentUser = null
        this.token = null
        localStorage.removeItem('authToken')
        navigateTo('/')
      }
    },
    async fetchMe() {
      try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('authToken')
        if (!token) throw new Error('No token')
        const data = await $fetch(`${config.public.apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.currentUser = data
        this.error = null
        return data
      } catch (err: any) {
        this.error = err.data?.message || err.message
        this.currentUser = null
        throw err
      }
    },
    // User endpoints
    async fetchUsers(query = '') {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const data = await $fetch(`${config.public.apiBase}/users${query ? `?q=${query}` : ''}`)
        this.users = data as any[]
        this.error = null
      } catch (err: any) {
        this.error = err.data?.message || err.message
      } finally {
        this.loading = false
      }
    },
    async fetchUserById(id: string) {
      try {
        const config = useRuntimeConfig()
        return await $fetch(`${config.public.apiBase}/users/${id}`)
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      }
    },
    async addUser(name: string, firstName: string, contacts?: any) {
      try {
        const config = useRuntimeConfig()
        return await $fetch(`${config.public.apiBase}/users`, {
          method: 'POST',
          body: { name, firstName, contacts }
        })
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      }
    },
    async boostRating(id: string) {
      try {
        const config = useRuntimeConfig()
        const res: any = await $fetch(`${config.public.apiBase}/users/${id}/rating`, {
          method: 'POST',
          body: { delta: 1.0 }
        })
        if (res.success && this.currentUser && this.currentUser.account.id === parseInt(id)) {
          this.currentUser.account.reputation_score = res.newRating
        }
        return res
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      }
    },
    async leaveFeedback(id: string, rating: number) {
      try {
        const config = useRuntimeConfig()
        return await $fetch(`${config.public.apiBase}/users/${id}/feedback`, {
          method: 'POST',
          body: { rating }
        })
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      }
    },
    async resetDatabase() {
      try {
        const config = useRuntimeConfig()
        return await $fetch(`${config.public.apiBase}/reset`, {
          method: 'POST'
        })
      } catch (err: any) {
        this.error = err.data?.message || err.message
        throw err
      }
    },
    setCurrentUser(user: any) {
      this.currentUser = user
    }
  }
})
