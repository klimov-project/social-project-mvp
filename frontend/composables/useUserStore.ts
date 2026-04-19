import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as any,
    users: [] as any[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchUsers(query = '') {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const data = await $fetch(`${config.public.apiBase}/users${query ? `?q=${query}` : ''}`)
        this.users = data as any[]
      } catch (err: any) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchUserById(id: string) {
      try {
        const config = useRuntimeConfig()
        return await $fetch(`${config.public.apiBase}/users/${id}`)
      } catch (err: any) {
        this.error = err.message
      }
    },
    async boostRating(id: string) {
      const config = useRuntimeConfig()
      const res: any = await $fetch(`${config.public.apiBase}/users/${id}/rating`, {
        method: 'POST',
        body: { delta: 1.0 }
      })
      if (res.success && this.currentUser && this.currentUser.id === id) {
        this.currentUser.rating = res.newRating
      }
      return res
    },
    async leaveFeedback(id: string, rating: number) {
      const config = useRuntimeConfig()
      return await $fetch(`${config.public.apiBase}/users/${id}/feedback`, {
        method: 'POST',
        body: { rating }
      })
    },
    login(user: any) {
      this.currentUser = user
    },
    logout() {
      this.currentUser = null
      navigateTo('/')
    }
  }
})
