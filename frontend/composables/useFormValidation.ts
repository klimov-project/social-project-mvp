export const useFormValidation = () => {
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,50}$/
    return nameRegex.test(name)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    return phone.length >= 7 && /^\d+$/.test(phone)
  }

  const validateTelegram = (username: string): boolean => {
    const telegramRegex = /^[a-zA-Z0-9_]{5,}$/
    return telegramRegex.test(username)
  }

  const validatePassportSeries = (series: string): boolean => {
    return /^\d{4}$/.test(series)
  }

  const validatePassportNumber = (number: string): boolean => {
    return /^\d{6}$/.test(number)
  }

  const validatePassportDate = (date: string): boolean => {
    const passportDate = new Date(date)
    const today = new Date()
    return passportDate <= today
  }

  const validateIssuedBy = (text: string): boolean => {
    return text.length >= 3
  }

  return {
    validateName,
    validateEmail,
    validatePhone,
    validateTelegram,
    validatePassportSeries,
    validatePassportNumber,
    validatePassportDate,
    validateIssuedBy
  }
}
