import type { VerificationData } from '~/stores/verificationStore'

export interface VerificationResponse {
  success: boolean
  message: string
  data?: {
    verificationId: string
    trustLevel: number
    timestamp: string
  }
  error?: string
}

export const useVerificationApi = () => {
  const config = useRuntimeConfig()

  /**
   * Mock API call to submit verification data
   * In production, this would send to /verify/submit endpoint
   */
  const submitVerification = async (data: VerificationData): Promise<VerificationResponse> => {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        try {
          // Mock success response (90% success rate for demo)
          if (Math.random() > 0.1) {
            resolve({
              success: true,
              message: 'Verification submitted successfully',
              data: {
                verificationId: `VER-${Date.now()}`,
                trustLevel: 100,
                timestamp: new Date().toISOString()
              }
            })
          } else {
            reject(new Error('Mock verification failed - please try again'))
          }
        } catch (error) {
          reject(error)
        }
      }, 1500)
    })
  }

  /**
   * Get verification status for current user
   */
  const getVerificationStatus = async (): Promise<{
    isVerified: boolean
    trustLevel: number
    lastUpdated?: string
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isVerified: false,
          trustLevel: 0
        })
      }, 500)
    })
  }

  /**
   * Upload photo to mock server
   */
  const uploadPhoto = async (file: File): Promise<{ url: string; key: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTimeout(() => {
          resolve({
            url: e.target?.result as string,
            key: `photo-${Date.now()}`
          })
        }, 800)
      }
      reader.readAsDataURL(file)
    })
  }

  return {
    submitVerification,
    getVerificationStatus,
    uploadPhoto
  }
}
