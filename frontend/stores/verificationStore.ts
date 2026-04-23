import { defineStore } from 'pinia';

export interface VerificationData {
  fullName: {
    lastName: string;
    firstName: string;
    patronymic?: string;
  };
  passport: {
    series: string;
    number: string;
    dateOfIssue: string;
    issuedBy: string;
    photo?: string;
  };
  contacts: {
    email: string;
    phone: string;
    countryCode: string;
    telegram: string;
  };
}

export const useVerificationStore = defineStore('verification', {
  state: () => ({
    currentStep: 1,
    totalSteps: 5,
    verificationData: {
      fullName: {
        lastName: '',
        firstName: '',
        patronymic: '',
      },
      passport: {
        series: '',
        number: '',
        dateOfIssue: '',
        issuedBy: '',
        photo: undefined,
      },
      contacts: {
        email: '',
        phone: '',
        countryCode: '+1',
        telegram: '',
      },
    } as VerificationData,
    isLoading: false,
    error: null as string | null,
    isVerified: false,
    trustLevel: 0,
  }),

  getters: {
    progressPercentage(): number {
      return Math.round((this.currentStep / this.totalSteps) * 100);
    },
  },

  actions: {
    setFullName(lastName: string, firstName: string, patronymic?: string) {
      this.verificationData.fullName = {
        lastName,
        firstName,
        patronymic: patronymic || '',
      };
    },

    setPassportData(
      series: string,
      number: string,
      dateOfIssue: string,
      issuedBy: string,
    ) {
      this.verificationData.passport.series = series;
      this.verificationData.passport.number = number;
      this.verificationData.passport.dateOfIssue = dateOfIssue;
      this.verificationData.passport.issuedBy = issuedBy;
    },

    setPassportPhoto(photo: string) {
      this.verificationData.passport.photo = photo;
    },

    removePassportPhoto() {
      this.verificationData.passport.photo = undefined;
    },

    setContacts(
      email: string,
      phone: string,
      countryCode: string,
      telegram: string,
    ) {
      this.verificationData.contacts = { email, phone, countryCode, telegram };
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    goToStep(step: number) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step;
      }
    },

    async submitVerification() {
      this.isLoading = true;
      this.error = null;

      try {
        // Mock API call - in real app, this would send to /verify/submit
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate success
        this.isVerified = true;
        this.trustLevel = 100;
        this.currentStep = 6; // Success screen

        // Save to localStorage
        localStorage.setItem(
          'verificationData',
          JSON.stringify(this.verificationData),
        );
        localStorage.setItem('verificationStatus', 'verified');
      } catch (err) {
        this.error = err.message || 'Failed to save verification data';
      } finally {
        this.isLoading = false;
      }
    },

    resetVerification() {
      this.currentStep = 1;
      this.verificationData = {
        fullName: { lastName: '', firstName: '', patronymic: '' },
        passport: {
          series: '',
          number: '',
          dateOfIssue: '',
          issuedBy: '',
          photo: undefined,
        },
        contacts: { email: '', phone: '', countryCode: '+1', telegram: '' },
      };
      this.error = null;
      this.isVerified = false;
      this.trustLevel = 0;
    },

    loadFromStorage() {
      const saved = localStorage.getItem('verificationData');
      if (saved) {
        try {
          this.verificationData = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to load verification data from storage');
        }
      }
    },
  },
});
