<script setup lang="ts">
import { useVerificationStore } from '../../../stores/verificationStore';

const verificationStore = useVerificationStore();
const router = useRouter();

const form = reactive({
  email: verificationStore.verificationData.contacts.email,
  phone: verificationStore.verificationData.contacts.phone,
  countryCode: verificationStore.verificationData.contacts.countryCode,
  telegram: verificationStore.verificationData.contacts.telegram,
});

const isEmailValid = computed((): boolean =>
  !form.email ? false : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
);

const isTelegramValid = computed((): boolean =>
  !form.telegram ? false : /^[a-zA-Z0-9_]{5,}$/.test(form.telegram),
);

const isContactsValid = computed(
  (): boolean => isEmailValid || isTelegramValid || form.phone.length > 0,
);

const errors = reactive({
  email: '',
  phone: '',
  telegram: '',
});

const addedContacts = computed(() => {
  const contacts = [];
  if (form.email) contacts.push(`📧 ${form.email}`);
  if (form.phone) contacts.push(`📱 ${form.countryCode} ${form.phone}`);
  if (form.telegram) contacts.push(`💬 @${form.telegram}`);
  return contacts;
});

const getEmailInputClass = () => {
  const base =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition';
  if (!form.email) return `${base} border-gray-300`;
  return isEmailValid ? `${base} border-green-500` : `${base} border-red-500`;
};

const validateContacts = () => {
  errors.email = form.email && !isEmailValid ? 'Invalid email format' : '';
  errors.phone =
    form.phone && form.phone.length < 7
      ? 'Phone must be at least 7 digits'
      : '';
  errors.telegram =
    form.telegram && !isTelegramValid ? 'Username: 5+ chars, a-z, 0-9, _' : '';
};

const removeContact = (index: number) => {
  if (index === 0) form.email = '';
  else if (index === 1) form.phone = '';
  else if (index === 2) form.telegram = '';
};

const handleNext = () => {
  validateContacts();
  if (isContactsValid) {
    verificationStore.setContacts(
      form.email,
      form.phone,
      form.countryCode,
      form.telegram,
    );
    verificationStore.nextStep();
    router.push('/profile/verify/confirmation');
  }
};

const handleSkip = () => {
  verificationStore.nextStep();
  router.push('/profile/verify/confirmation');
};

const handleBack = () => {
  router.push('/profile/verify/passport');
};

onMounted(() => {
  verificationStore.goToStep(4);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <!-- Progress Bar -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold text-gray-800">Contact Details</h2>
          <span class="text-sm text-gray-500">
            {{ verificationStore.currentStep }}/{{
              verificationStore.totalSteps
            }}
          </span>
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
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.email"
              type="email"
              placeholder="example@mail.com"
              @input="validateContacts"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              :class="getEmailInputClass()"
            />
            <span
              v-if="isEmailValid"
              class="absolute right-3 top-2.5 text-green-500"
              >✓</span
            >
            <span
              v-else-if="form.email"
              class="absolute right-3 top-2.5 text-red-500"
              >✗</span
            >
          </div>
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email }}
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Phone <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <select
              v-model="form.countryCode"
              class="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="+1">+1</option>
              <option value="+7">+7</option>
              <option value="+44">+44</option>
              <option value="+49">+49</option>
              <option value="+33">+33</option>
            </select>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="9991234567"
              @input="validateContacts"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              :class="{ 'border-red-500': errors.phone }"
            />
          </div>
          <p v-if="errors.phone" class="text-red-500 text-xs mt-1">
            {{ errors.phone }}
          </p>
        </div>

        <!-- Telegram -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Telegram <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-gray-500">@</span>
            <input
              v-model="form.telegram"
              type="text"
              placeholder="username"
              @input="validateContacts"
              class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              :class="{ 'border-red-500': errors.telegram }"
            />
            <span
              v-if="isTelegramValid"
              class="absolute right-3 top-2.5 text-green-500"
              >✓</span
            >
            <span
              v-else-if="form.telegram"
              class="absolute right-3 top-2.5 text-red-500"
              >✗</span
            >
          </div>
          <p v-if="errors.telegram" class="text-red-500 text-xs mt-1">
            {{ errors.telegram }}
          </p>
        </div>

        <!-- Added Contacts Display -->
        <div v-if="addedContacts.length > 0" class="mt-6 space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Added Contacts:</h3>
          <div
            v-for="(contact, index) in addedContacts"
            :key="index"
            class="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
          >
            <span class="text-sm text-gray-700">{{ contact }}</span>
            <button
              type="button"
              @click="removeContact(index)"
              class="text-red-500 hover:text-red-700 transition"
            >
              ✕
            </button>
          </div>
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
            :disabled="!isContactsValid"
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
