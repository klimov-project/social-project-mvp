<script setup lang="ts">
import { useVerificationStore } from '../../../stores/verificationStore';

const verificationStore = useVerificationStore();
const router = useRouter();

const form = reactive({
  lastName: verificationStore.verificationData.fullName.lastName,
  firstName: verificationStore.verificationData.fullName.firstName,
  patronymic: verificationStore.verificationData.fullName.patronymic,
});

const errors = reactive({
  lastName: '',
  firstName: '',
  patronymic: '',
});

const isFullNameValid = computed(
  (): boolean => form.lastName.length >= 2 && form.firstName.length >= 2,
);

const validateName = () => {
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,50}$/;

  errors.lastName =
    form.lastName && !nameRegex.test(form.lastName)
      ? 'Only letters, spaces, and hyphens (2-50 characters)'
      : '';

  errors.firstName =
    form.firstName && !nameRegex.test(form.firstName)
      ? 'Only letters, spaces, and hyphens (2-50 characters)'
      : '';

  errors.patronymic =
    form.patronymic && !nameRegex.test(form.patronymic)
      ? 'Only letters, spaces, and hyphens (2-50 characters)'
      : '';
};

const handleNext = () => {
  validateName();
  if (!errors.lastName && !errors.firstName) {
    verificationStore.setFullName(
      form.lastName,
      form.firstName,
      form.patronymic,
    );
    verificationStore.nextStep();
    router.push('/profile/verify/passport');
  }
};

const handleSkip = () => {
  verificationStore.nextStep();
  router.push('/profile/verify/passport');
};

const handleBack = () => {
  router.push('/');
};

onMounted(() => {
  verificationStore.goToStep(2);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold text-gray-800">Full Name</h2>
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

      <!-- Form -->
      <form @submit.prevent="handleNext" class="space-y-4">
        <!-- Last Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.lastName"
            type="text"
            placeholder="Enter last name"
            @input="validateName"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            :class="{ 'border-red-500': errors.lastName }"
          />
          <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">
            {{ errors.lastName }}
          </p>
        </div>

        <!-- First Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.firstName"
            type="text"
            placeholder="Enter first name"
            @input="validateName"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            :class="{ 'border-red-500': errors.firstName }"
          />
          <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">
            {{ errors.firstName }}
          </p>
        </div>

        <!-- Patronymic (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Patronymic <span class="text-gray-400">(optional)</span>
          </label>
          <input
            v-model="form.patronymic"
            type="text"
            placeholder="Enter patronymic"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <!-- Buttons -->
        <div class="flex gap-3 mt-8">
          <button
            type="button"
            @click="handleSkip"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Skip
          </button>
          <button
            type="submit"
            :disabled="!isFullNameValid"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Next
          </button>
        </div>
      </form>

      <!-- Back Button -->
      <button
        @click="handleBack"
        class="w-full mt-3 text-gray-600 hover:text-gray-800 font-medium py-2 transition"
      >
        ← Back
      </button>
    </div>
  </div>
</template>
