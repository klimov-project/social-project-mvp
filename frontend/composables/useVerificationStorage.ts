import { useVerificationStore } from '../stores/verificationStore';

export const useVerificationStorage = () => {
  const STORAGE_KEY = 'verification_data';
  const STATUS_KEY = 'verification_status';

  const saveVerificationData = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save verification data:', error);
    }
  };

  const loadVerificationData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load verification data:', error);
      return null;
    }
  };

  const saveVerificationStatus = (status: string) => {
    try {
      localStorage.setItem(STATUS_KEY, status);
    } catch (error) {
      console.error('Failed to save verification status:', error);
    }
  };

  const getVerificationStatus = (): string | null => {
    try {
      return localStorage.getItem(STATUS_KEY);
    } catch (error) {
      console.error('Failed to get verification status:', error);
      return null;
    }
  };

  const clearVerificationData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STATUS_KEY);
    } catch (error) {
      console.error('Failed to clear verification data:', error);
    }
  };

  const autosaveVerificationData = () => {
    const store = useVerificationStore();
    saveVerificationData(store.verificationData);
  };

  return {
    saveVerificationData,
    loadVerificationData,
    saveVerificationStatus,
    getVerificationStatus,
    clearVerificationData,
    autosaveVerificationData,
  };
};
