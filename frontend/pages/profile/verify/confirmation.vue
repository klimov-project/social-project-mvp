<script setup lang="ts">
import { useVerificationStore } from '../../../stores/verificationStore';

const verificationStore = useVerificationStore();
const router = useRouter();

const isLoading = ref(false);
const error = ref('');

const editFullName = () => {
  router.push('/profile/verify/fullname');
};

const editPassport = () => {
  router.push('/profile/verify/passport');
};

const editContacts = () => {
  router.push('/profile/verify/contacts');
};

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    await verificationStore.submitVerification();
    // Navigate to success screen
    router.push('/profile/verify/success');
  } catch (err) {
    error.value = err.message || 'Failed to submit verification';
    isLoading.value = false;
  }
};

const handleBack = () => {
  router.push('/profile/verify/contacts');
};

onMounted(() => {
  verificationStore.goToStep(5);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold text-gray-800">Confirmation</h2>
          <span class="text-sm text-gray-500"
            >{{ verificationStore.currentStep }}/{{
              verificationStore.totalSteps
            }}</span
          >
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: verificationStore.progressPercentage + '%' }"
          />
        </div>
      </div>

      <!-- Confirmation Content -->
      <div class="space-y-4 mb-8">
        <!-- Full Name Block -->
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-800">Full Name</h3>
            <button
              @click="editFullName"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
            >
              Edit
            </button>
          </div>
          <p class="text-gray-700">
            {{ verificationStore.verificationData.fullName.lastName }}
            {{ verificationStore.verificationData.fullName.firstName }}
            <span v-if="verificationStore.verificationData.fullName.patronymic">
              {{ verificationStore.verificationData.fullName.patronymic }}
            </span>
          </p>
        </div>

        <!-- Passport Block -->
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-800">Passport</h3>
            <button
              @click="editPassport"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
            >
              Edit
            </button>
          </div>
          <div class="space-y-1 text-sm text-gray-700">
            <p>
              <strong>Series/Number:</strong>
              {{ verificationStore.verificationData.passport.series }}/{{
                verificationStore.verificationData.passport.number
              }}
            </p>
            <p>
              <strong>Date of Issue:</strong>
              {{ verificationStore.verificationData.passport.dateOfIssue }}
            </p>
            <p>
              <strong>Issued By:</strong>
              {{ verificationStore.verificationData.passport.issuedBy }}
            </p>
            <div
              v-if="verificationStore.verificationData.passport.photo"
              class="mt-2"
            >
              <img
                :src="verificationStore.verificationData.passport.photo"
                alt="Passport"
                class="w-full h-32 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        <!-- Contacts Block -->
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-gray-800">Contacts</h3>
            <button
              @click="editContacts"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
            >
              Edit
            </button>
          </div>
          <div class="space-y-1 text-sm text-gray-700">
            <p v-if="verificationStore.verificationData.contacts.email">
              <strong>Email:</strong>
              {{ verificationStore.verificationData.contacts.email }}
            </p>
            <p v-if="verificationStore.verificationData.contacts.phone">
              <strong>Phone:</strong>
              {{ verificationStore.verificationData.contacts.countryCode }}
              {{ verificationStore.verificationData.contacts.phone }}
            </p>
            <p v-if="verificationStore.verificationData.contacts.telegram">
              <strong>Telegram:</strong> @{{
                verificationStore.verificationData.contacts.telegram
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        @click="handleSubmit"
        :disabled="isLoading"
        class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        <span v-if="isLoading" class="animate-spin">↻</span>
        {{ isLoading ? 'Sending...' : 'OK →' }}
      </button>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm"
      >
        {{ error }}
      </div>

      <!-- Back Button -->
      <button
        @click="handleBack"
        :disabled="isLoading"
        class="w-full mt-3 text-gray-600 hover:text-gray-800 font-medium py-2 transition disabled:opacity-50"
      >
        ← Back
      </button>
    </div>
  </div>
</template>
