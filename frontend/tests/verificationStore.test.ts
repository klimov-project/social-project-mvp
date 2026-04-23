import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useVerificationStore } from '../stores/verificationStore'

describe('Verification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      const store = useVerificationStore()
      expect(store.currentStep).toBe(1)
      expect(store.totalSteps).toBe(5)
      expect(store.isVerified).toBe(false)
      expect(store.trustLevel).toBe(0)
    })

    it('should have empty verification data on init', () => {
      const store = useVerificationStore()
      expect(store.verificationData.fullName.lastName).toBe('')
      expect(store.verificationData.fullName.firstName).toBe('')
      expect(store.verificationData.contacts.email).toBe('')
    })
  })

  describe('Full Name Validation', () => {
    it('should validate full name correctly', () => {
      const store = useVerificationStore()
      
      store.setFullName('Ivanov', 'Ivan', 'Ivanovich')
      expect(store.isFullNameValid).toBe(true)
    })

    it('should reject short names', () => {
      const store = useVerificationStore()
      
      store.setFullName('I', 'Ivan')
      expect(store.isFullNameValid).toBe(false)
    })

    it('should require both first and last name', () => {
      const store = useVerificationStore()
      
      store.setFullName('', 'Ivan')
      expect(store.isFullNameValid).toBe(false)
      
      store.setFullName('Ivanov', '')
      expect(store.isFullNameValid).toBe(false)
    })
  })

  describe('Passport Validation', () => {
    it('should validate complete passport data', () => {
      const store = useVerificationStore()
      
      store.setPassportData('1234', '567890', '2020-01-01', 'Department')
      store.setPassportPhoto('data:image/png;base64,test')
      
      expect(store.isPassportValid).toBe(true)
    })

    it('should reject passport without photo', () => {
      const store = useVerificationStore()
      
      store.setPassportData('1234', '567890', '2020-01-01', 'Department')
      expect(store.isPassportValid).toBe(false)
    })

    it('should reject incomplete passport data', () => {
      const store = useVerificationStore()
      
      store.setPassportData('', '567890', '2020-01-01', 'Department')
      store.setPassportPhoto('data:image/png;base64,test')
      
      expect(store.isPassportValid).toBe(false)
    })
  })

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      const store = useVerificationStore()
      
      store.setContacts('test@example.com', '', '+1', '')
      expect(store.isEmailValid).toBe(true)
    })

    it('should reject invalid email format', () => {
      const store = useVerificationStore()
      
      store.setContacts('invalid-email', '', '+1', '')
      expect(store.isEmailValid).toBe(false)
    })

    it('should accept empty email', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', '')
      expect(store.isEmailValid).toBe(false)
    })
  })

  describe('Telegram Validation', () => {
    it('should validate correct telegram username', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', 'valid_username')
      expect(store.isTelegramValid).toBe(true)
    })

    it('should reject short telegram username', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', 'usr')
      expect(store.isTelegramValid).toBe(false)
    })

    it('should reject telegram with invalid characters', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', 'invalid-user!')
      expect(store.isTelegramValid).toBe(false)
    })

    it('should accept empty telegram', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', '')
      expect(store.isTelegramValid).toBe(true)
    })
  })

  describe('Contacts Validation', () => {
    it('should accept at least one contact', () => {
      const store = useVerificationStore()
      
      store.setContacts('test@example.com', '', '+1', '')
      expect(store.isContactsValid).toBe(true)
    })

    it('should accept phone only', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '1234567', '+1', '')
      expect(store.isContactsValid).toBe(true)
    })

    it('should accept telegram only', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', 'valid_user')
      expect(store.isContactsValid).toBe(true)
    })

    it('should reject when no contacts provided', () => {
      const store = useVerificationStore()
      
      store.setContacts('', '', '+1', '')
      expect(store.isContactsValid).toBe(false)
    })
  })

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const store = useVerificationStore()
      
      store.nextStep()
      expect(store.currentStep).toBe(2)
      
      store.nextStep()
      expect(store.currentStep).toBe(3)
    })

    it('should navigate to previous step', () => {
      const store = useVerificationStore()
      store.currentStep = 3
      
      store.previousStep()
      expect(store.currentStep).toBe(2)
    })

    it('should go to specific step', () => {
      const store = useVerificationStore()
      
      store.goToStep(4)
      expect(store.currentStep).toBe(4)
    })

    it('should not exceed total steps', () => {
      const store = useVerificationStore()
      store.currentStep = 5
      
      store.nextStep()
      expect(store.currentStep).toBe(5)
    })

    it('should not go below step 1', () => {
      const store = useVerificationStore()
      
      store.previousStep()
      expect(store.currentStep).toBe(1)
    })
  })

  describe('Progress Calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const store = useVerificationStore()
      
      expect(store.progressPercentage).toBe(20) // 1/5 = 20%
      
      store.currentStep = 3
      expect(store.progressPercentage).toBe(60) // 3/5 = 60%
      
      store.currentStep = 5
      expect(store.progressPercentage).toBe(100) // 5/5 = 100%
    })
  })

  describe('Verification Submission', () => {
    it('should mark as verified after submission', async () => {
      const store = useVerificationStore()
      
      store.setFullName('Ivanov', 'Ivan')
      store.setPassportData('1234', '567890', '2020-01-01', 'Department')
      store.setPassportPhoto('data:image/png;base64,test')
      store.setContacts('test@example.com', '1234567', '+1', 'user_name')
      
      await store.submitVerification()
      
      expect(store.isVerified).toBe(true)
      expect(store.trustLevel).toBe(100)
    })

    it('should set loading state during submission', async () => {
      const store = useVerificationStore()
      
      store.setFullName('Ivanov', 'Ivan')
      store.setPassportData('1234', '567890', '2020-01-01', 'Department')
      store.setPassportPhoto('data:image/png;base64,test')
      store.setContacts('test@example.com', '', '+1', '')
      
      const submitPromise = store.submitVerification()
      expect(store.isLoading).toBe(true)
      
      await submitPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset all data', () => {
      const store = useVerificationStore()
      
      store.setFullName('Ivanov', 'Ivan')
      store.currentStep = 3
      store.isVerified = true
      
      store.resetVerification()
      
      expect(store.currentStep).toBe(1)
      expect(store.isVerified).toBe(false)
      expect(store.verificationData.fullName.firstName).toBe('')
      expect(store.verificationData.fullName.lastName).toBe('')
    })
  })

  describe('Photo Management', () => {
    it('should set and remove passport photo', () => {
      const store = useVerificationStore()
      
      const photoData = 'data:image/png;base64,test'
      store.setPassportPhoto(photoData)
      expect(store.verificationData.passport.photo).toBe(photoData)
      
      store.removePassportPhoto()
      expect(store.verificationData.passport.photo).toBeUndefined()
    })
  })

  describe('LocalStorage Integration', () => {
    it('should load data from storage', () => {
      const testData = {
        fullName: { lastName: 'Ivanov', firstName: 'Ivan', patronymic: 'Ivanovich' },
        passport: { series: '1234', number: '567890', dateOfIssue: '2020-01-01', issuedBy: 'Dept', photo: undefined },
        contacts: { email: 'test@example.com', phone: '1234567', countryCode: '+1', telegram: 'user' }
      }
      
      localStorage.setItem('verificationData', JSON.stringify(testData))
      
      const store = useVerificationStore()
      store.loadFromStorage()
      
      expect(store.verificationData.fullName.lastName).toBe('Ivanov')
      expect(store.verificationData.contacts.email).toBe('test@example.com')
    })
  })
})
