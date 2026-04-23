import { describe, it, expect } from 'vitest'
import { useFormValidation } from '../composables/useFormValidation'

describe('Form Validation Composable', () => {
  const { 
    validateName, 
    validateEmail, 
    validatePhone, 
    validateTelegram,
    validatePassportSeries,
    validatePassportNumber,
    validatePassportDate,
    validateIssuedBy
  } = useFormValidation()

  describe('Name Validation', () => {
    it('should accept valid English names', () => {
      expect(validateName('John')).toBe(true)
      expect(validateName('Smith-Johnson')).toBe(true)
      expect(validateName('Mary Ann')).toBe(true)
    })

    it('should accept valid Russian names', () => {
      expect(validateName('Иванов')).toBe(true)
      expect(validateName('Петр-Иван')).toBe(true)
    })

    it('should reject short names', () => {
      expect(validateName('J')).toBe(false)
      expect(validateName('A')).toBe(false)
    })

    it('should reject names with special characters', () => {
      expect(validateName('John@123')).toBe(false)
      expect(validateName('Mary!')).toBe(false)
    })

    it('should reject names exceeding max length', () => {
      const longName = 'A'.repeat(51)
      expect(validateName(longName)).toBe(false)
    })
  })

  describe('Email Validation', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.user@domain.co.uk')).toBe(true)
      expect(validateEmail('name+tag@email.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid.email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('user @example.com')).toBe(false)
    })

    it('should reject empty email', () => {
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('1234567')).toBe(true)
      expect(validatePhone('9991234567')).toBe(true)
      expect(validatePhone('1111111111')).toBe(true)
    })

    it('should reject short phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('12345')).toBe(false)
    })

    it('should reject phone with non-digits', () => {
      expect(validatePhone('123-456-7890')).toBe(false)
      expect(validatePhone('(123) 456-7890')).toBe(false)
    })

    it('should reject empty phone', () => {
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('Telegram Validation', () => {
    it('should accept valid telegram usernames', () => {
      expect(validateTelegram('username')).toBe(true)
      expect(validateTelegram('user_name')).toBe(true)
      expect(validateTelegram('user123')).toBe(true)
      expect(validateTelegram('_user_')).toBe(true)
    })

    it('should reject short usernames', () => {
      expect(validateTelegram('usr')).toBe(false)
      expect(validateTelegram('user')).toBe(false)
    })

    it('should reject usernames with invalid characters', () => {
      expect(validateTelegram('user-name')).toBe(false)
      expect(validateTelegram('user.name')).toBe(false)
      expect(validateTelegram('user@name')).toBe(false)
      expect(validateTelegram('user name')).toBe(false)
    })

    it('should reject empty username', () => {
      expect(validateTelegram('')).toBe(false)
    })
  })

  describe('Passport Series Validation', () => {
    it('should accept valid passport series', () => {
      expect(validatePassportSeries('1234')).toBe(true)
      expect(validatePassportSeries('0000')).toBe(true)
      expect(validatePassportSeries('9999')).toBe(true)
    })

    it('should reject non-4-digit series', () => {
      expect(validatePassportSeries('123')).toBe(false)
      expect(validatePassportSeries('12345')).toBe(false)
    })

    it('should reject series with letters', () => {
      expect(validatePassportSeries('12A4')).toBe(false)
      expect(validatePassportSeries('ABCD')).toBe(false)
    })

    it('should reject empty series', () => {
      expect(validatePassportSeries('')).toBe(false)
    })
  })

  describe('Passport Number Validation', () => {
    it('should accept valid passport numbers', () => {
      expect(validatePassportNumber('567890')).toBe(true)
      expect(validatePassportNumber('000000')).toBe(true)
      expect(validatePassportNumber('999999')).toBe(true)
    })

    it('should reject non-6-digit numbers', () => {
      expect(validatePassportNumber('56789')).toBe(false)
      expect(validatePassportNumber('5678901')).toBe(false)
    })

    it('should reject numbers with letters', () => {
      expect(validatePassportNumber('56789A')).toBe(false)
      expect(validatePassportNumber('ABCDEF')).toBe(false)
    })

    it('should reject empty number', () => {
      expect(validatePassportNumber('')).toBe(false)
    })
  })

  describe('Passport Date Validation', () => {
    it('should accept past dates', () => {
      expect(validatePassportDate('2020-01-01')).toBe(true)
      expect(validatePassportDate('2010-12-31')).toBe(true)
    })

    it('should accept today date', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(validatePassportDate(today)).toBe(true)
    })

    it('should reject future dates', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      expect(validatePassportDate(tomorrow)).toBe(false)
    })
  })

  describe('Issued By Validation', () => {
    it('should accept valid issued by text', () => {
      expect(validateIssuedBy('Department')).toBe(true)
      expect(validateIssuedBy('Ministry of Internal Affairs')).toBe(true)
    })

    it('should reject short text', () => {
      expect(validateIssuedBy('AB')).toBe(false)
      expect(validateIssuedBy('A')).toBe(false)
    })

    it('should accept exactly 3 characters', () => {
      expect(validateIssuedBy('ABC')).toBe(true)
    })

    it('should reject empty text', () => {
      expect(validateIssuedBy('')).toBe(false)
    })
  })
})
