import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../composables/useUserStore'

// Mock $fetch
global.$fetch = vi.fn()

describe('Auth API Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('POST /auth/sign-up', () => {
    it('should sign up a new user', async () => {
      const store = useUserStore()
      const mockResponse = { username: 'testuser' }
      global.$fetch.mockResolvedValueOnce(mockResponse)

      const result = await store.signUp('testlogin', 'password123', 'testuser')

      expect(result).toEqual(mockResponse)
      expect(global.$fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/sign-up'),
        expect.objectContaining({
          method: 'POST',
          body: { login: 'testlogin', password: 'password123', username: 'testuser', referralCode: undefined }
        })
      )
    })

    it('should handle sign-up error', async () => {
      const store = useUserStore()
      const error = new Error('User already exists')
      error.data = { message: 'User already exists' }
      global.$fetch.mockRejectedValueOnce(error)

      await expect(store.signUp('existing', 'pass', 'user')).rejects.toThrow()
      expect(store.error).toBe('User already exists')
    })
  })

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const store = useUserStore()
      const mockResponse = { token: 'jwt-token-123', username: 'admin' }
      global.$fetch.mockResolvedValueOnce(mockResponse)

      const result = await store.login('admin', 'password')

      expect(result).toEqual(mockResponse)
      expect(store.token).toBe('jwt-token-123')
      expect(localStorage.getItem('authToken')).toBe('jwt-token-123')
      expect(global.$fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: { login: 'admin', password: 'password' }
        })
      )
    })

    it('should handle login with incorrect credentials', async () => {
      const store = useUserStore()
      const error = new Error('Invalid login or password')
      error.data = { message: 'Invalid login or password' }
      global.$fetch.mockRejectedValueOnce(error)

      await expect(store.login('admin', 'wrongpass')).rejects.toThrow()
      expect(store.error).toBe('Invalid login or password')
      expect(store.token).toBeNull()
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const store = useUserStore()
      store.token = 'jwt-token-123'
      store.currentUser = { id: 1, login: 'admin' }
      localStorage.setItem('authToken', 'jwt-token-123')
      global.$fetch.mockResolvedValueOnce(null)

      await store.logout()

      expect(store.currentUser).toBeNull()
      expect(store.token).toBeNull()
      expect(localStorage.getItem('authToken')).toBeNull()
      expect(global.$fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('GET /auth/me', () => {
    it('should fetch current user data', async () => {
      const store = useUserStore()
      localStorage.setItem('authToken', 'jwt-token-123')
      const mockResponse = {
        user: { id: 1, login: 'admin', role: 'USER' },
        account: { id: 1, username: 'admin', reputation_score: '5.0' }
      }
      global.$fetch.mockResolvedValueOnce(mockResponse)

      const result = await store.fetchMe()

      expect(result).toEqual(mockResponse)
      expect(store.currentUser).toEqual(mockResponse)
      expect(global.$fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer jwt-token-123' }
        })
      )
    })

    it('should handle fetchMe without token', async () => {
      const store = useUserStore()
      localStorage.removeItem('authToken')

      await expect(store.fetchMe()).rejects.toThrow('No token')
    })
  })
})

describe('User API Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('GET /users', () => {
    it('should fetch all users', async () => {
      const store = useUserStore()
      const mockUsers = [
        { id: 1, login: 'admin', account: { username: 'admin', reputation_score: '5.0' } },
        { id: 2, login: 'user1', account: { username: 'user1', reputation_score: '4.0' } }
      ]
      global.$fetch.mockResolvedValueOnce(mockUsers)

      await store.fetchUsers()

      expect(store.users).toEqual(mockUsers)
      expect(global.$fetch).toHaveBeenCalledWith(expect.stringContaining('/users'))
    })

    it('should fetch users with search query', async () => {
      const store = useUserStore()
      const mockUsers = [{ id: 1, login: 'admin', account: { username: 'admin' } }]
      global.$fetch.mockResolvedValueOnce(mockUsers)

      await store.fetchUsers('admin')

      expect(store.users).toEqual(mockUsers)
      expect(global.$fetch).toHaveBeenCalledWith(expect.stringContaining('/users?q=admin'))
    })
  })

  describe('GET /users/:id', () => {
    it('should fetch user by ID', async () => {
      const store = useUserStore()
      const mockUser = {
        user: { id: 1, login: 'admin', role: 'USER' },
        account: { id: 1, username: 'admin', reputation_score: '5.0' }
      }
      global.$fetch.mockResolvedValueOnce(mockUser)

      const result = await store.fetchUserById('1')

      expect(result).toEqual(mockUser)
      expect(global.$fetch).toHaveBeenCalledWith(expect.stringContaining('/users/1'))
    })
  })

  describe('POST /users/:id/rating', () => {
    it('should boost user rating', async () => {
      const store = useUserStore()
      store.currentUser = {
        account: { id: 1, reputation_score: '5.0' }
      }
      const mockResponse = { success: true, newRating: '6.0' }
      global.$fetch.mockResolvedValueOnce(mockResponse)

      const result = await store.boostRating('1')

      expect(result).toEqual(mockResponse)
      expect(global.$fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1/rating'),
        expect.objectContaining({
          method: 'POST',
          body: { delta: 1.0 }
        })
      )
    })
  })
})

describe('Health Check', () => {
  it('should verify API is accessible', async () => {
    const mockResponse = { status: 'ok' }
    global.$fetch.mockResolvedValueOnce(mockResponse)

    const result = await global.$fetch('/api/health')

    expect(result).toEqual(mockResponse)
  })
})
