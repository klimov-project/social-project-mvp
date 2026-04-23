<script setup lang="ts">
import { useVerificationStore } from '../../../stores/verificationStore';

const verificationStore = useVerificationStore();
const router = useRouter();

const startVerification = () => {
  verificationStore.resetVerification();
  verificationStore.goToStep(2);
  router.push('/profile/verify/fullname');
};

const closeVerification = () => {
  router.push('/profile');
};

onMounted(() => {
  verificationStore.goToStep(1);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-center mb-2 text-gray-800">
        Let's create your verification profile
      </h1>

      <!-- Icon/Illustration -->
      <div class="flex justify-center mb-8">
        <div
          class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-12 h-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2m4-4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-600 text-center mb-6 text-sm">
        Complete your verification to unlock all features and build trust in the
        community.
      </p>

      <!-- Steps -->
      <div class="space-y-4 mb-8">
        <div class="flex items-start">
          <div
            class="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold"
          >
            1
          </div>
          <div class="ml-3">
            <p class="text-gray-700 font-medium">Provide your full name</p>
          </div>
        </div>

        <div class="flex items-start">
          <div
            class="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold"
          >
            2
          </div>
          <div class="ml-3">
            <p class="text-gray-700 font-medium">
              Upload a document (face with passport)
            </p>
          </div>
        </div>

        <div class="flex items-start">
          <div
            class="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold"
          >
            3
          </div>
          <div class="ml-3">
            <p class="text-gray-700 font-medium">
              Fill in contact details (email, phone, Telegram)
            </p>
          </div>
        </div>
      </div>

      <!-- Start Button -->
      <button
        @click="startVerification"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
      >
        Start Verification
      </button>

      <!-- Close button -->
      <button
        @click="closeVerification"
        class="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
