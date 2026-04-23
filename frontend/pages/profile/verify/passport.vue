<script setup lang="ts">
import { useVerificationStore } from '../../../stores/verificationStore';

const verificationStore = useVerificationStore();
const router = useRouter();
const fileInput = ref<HTMLInputElement>();

const form = reactive({
  series: verificationStore.verificationData.passport.series,
  number: verificationStore.verificationData.passport.number,
  dateOfIssue: verificationStore.verificationData.passport.dateOfIssue,
  issuedBy: verificationStore.verificationData.passport.issuedBy,
  photo: verificationStore.verificationData.passport.photo,
});

const isPassportValid = computed(
  (): boolean =>
    form.series.length > 0 &&
    form.number.length > 0 &&
    form.dateOfIssue.length > 0 &&
    form.issuedBy.length > 3 &&
    form.photo !== undefined,
);

const errors = reactive({
  series: '',
  number: '',
  dateOfIssue: '',
  issuedBy: '',
  photo: '',
});

const validatePassport = () => {
  errors.series =
    form.series && !/^\d{4}$/.test(form.series) ? 'Must be 4 digits' : '';
  errors.number =
    form.number && !/^\d{6}$/.test(form.number) ? 'Must be 6 digits' : '';

  if (form.dateOfIssue) {
    const date = new Date(form.dateOfIssue);
    const today = new Date();
    errors.dateOfIssue = date > today ? 'Date cannot be in the future' : '';
  }

  errors.issuedBy =
    form.issuedBy && form.issuedBy.length < 3
      ? 'Must be at least 3 characters'
      : '';
};

const takePhoto = () => {
  // Mock: In real app, would open camera
  const mockPhoto =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%23ddd" width="300" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3EPassport Photo%3C/text%3E%3C/svg%3E';
  form.photo = mockPhoto;
  errors.photo = '';
};

const uploadFromGallery = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.photo = e.target?.result as string;
      errors.photo = '';
    };
    reader.readAsDataURL(file);
  }
};

const removePhoto = () => {
  form.photo = undefined;
};

const handleNext = () => {
  validatePassport();
  if (isPassportValid) {
    verificationStore.setPassportData(
      form.series,
      form.number,
      form.dateOfIssue,
      form.issuedBy,
    );
    if (form.photo) {
      verificationStore.setPassportPhoto(form.photo);
    }
    verificationStore.nextStep();
    router.push('/profile/verify/contacts');
  }
};

const handleSkip = () => {
  verificationStore.nextStep();
  router.push('/profile/verify/contacts');
};

const handleBack = () => {
  router.push('/profile/verify/fullname');
};

onMounted(() => {
  verificationStore.goToStep(3);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold text-gray-800">Passport Data</h2>
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
        <!-- Passport Series -->

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Passport Series <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.series"
            type="text"
            placeholder="e.g., 1234"
            maxlength="4"
            @input="validatePassport"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            :class="{ 'border-red-500': errors.series }"
          />
          <p v-if="errors.series" class="text-red-500 text-xs mt-1">
            {{ errors.series }}
          </p>
        </div>

        <!-- Passport Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Passport Number <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.number"
            type="text"
            placeholder="e.g., 567890"
            maxlength="6"
            @input="validatePassport"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            :class="{ 'border-red-500': errors.number }"
          />
          <p v-if="errors.number" class="text-red-500 text-xs mt-1">
            {{ errors.number }}
          </p>
        </div>

        <!-- Date of Issue -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date of Issue <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.dateOfIssue"
            type="date"
            @input="validatePassport"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            :class="{ 'border-red-500': errors.dateOfIssue }"
          />
          <p v-if="errors.dateOfIssue" class="text-red-500 text-xs mt-1">
            {{ errors.dateOfIssue }}
          </p>
        </div>

        <!-- Issued By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Issued By <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.issuedBy"
            type="text"
            placeholder="e.g., Department of Internal Affairs"
            @input="validatePassport"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            :class="{ 'border-red-500': errors.issuedBy }"
          />
          <p v-if="errors.issuedBy" class="text-red-500 text-xs mt-1">
            {{ errors.issuedBy }}
          </p>
        </div>

        <!-- Photo Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Passport Photo <span class="text-red-500">*</span>
          </label>

          <!-- Preview Area -->
          <div
            class="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50"
          >
            <div v-if="form.photo" class="relative">
              <img
                :src="form.photo"
                alt="Passport photo"
                class="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                @click="removePhoto"
                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center">
              <svg
                class="w-12 h-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p class="text-gray-500 text-sm">No photo uploaded</p>
            </div>
          </div>

          <!-- Upload Buttons -->
          <div class="flex gap-2">
            <button
              type="button"
              @click="takePhoto"
              class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg transition"
            >
              📷 Take Photo
            </button>
            <button
              type="button"
              @click="uploadFromGallery"
              class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg transition"
            >
              🖼️ Upload
            </button>
          </div>
          <p v-if="errors.photo" class="text-red-500 text-xs mt-2">
            {{ errors.photo }}
          </p>
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
            :disabled="!isPassportValid"
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

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>
