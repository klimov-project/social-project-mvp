<script setup lang="ts">
import { useVerificationStore } from '../../../stores/verificationStore';

const verificationStore = useVerificationStore();
const router = useRouter();

const returnToProfile = () => {
  // Reset verification flow
  verificationStore.resetVerification();
  // Navigate back to profile
  router.push('/profile');
};

onMounted(() => {
  // Ensure verification is marked as complete
  verificationStore.isVerified = true;
  verificationStore.trustLevel = 100;
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <!-- Success Icon -->
      <div class="mb-6 flex justify-center">
        <div
          class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse"
        >
          <svg
            class="w-16 h-16 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- Success Title -->
      <h1 class="text-3xl font-bold text-green-600 mb-2">
        Verification Completed!
      </h1>

      <!-- Success Message -->
      <p class="text-gray-600 mb-2">
        Congratulations! Your verification profile has been successfully
        created.
      </p>

      <p class="text-gray-500 text-sm mb-8">
        Thank you! Now all products and app features are available to you. Your
        trust level has been updated to 100%.
      </p>

      <!-- Stats -->
      <div class="bg-green-50 rounded-lg p-4 mb-8">
        <div class="flex items-center justify-center gap-2">
          <span class="text-3xl font-bold text-green-600">100%</span>
          <span class="text-gray-600">Trust Level</span>
        </div>
      </div>

      <!-- Return Button -->
      <button
        @click="returnToProfile"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-3"
      >
        Return to Profile
      </button>

      <!-- Additional Info -->
      <div class="text-xs text-gray-500 space-y-2">
        <p>✓ Full name verified</p>
        <p>✓ Passport data confirmed</p>
        <p>✓ Contact information validated</p>
      </div>
    </div>
  </div>
</template>
