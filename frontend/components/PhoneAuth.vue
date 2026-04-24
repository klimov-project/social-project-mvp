<script setup lang="ts">
const {
  step,
  countryCode,
  phoneNumber,
  verificationCode,
  isLoading,
  error,
  generatedPassword,
  fullPhone,
  sendVerificationCode,
  verifyCode,
  resetForm,
} = usePhoneAuth();

defineExpose({ resetForm });
</script>

<template>
  <div class=" ">
    <div v-if="step === 'phone'">
      <h2 class="text-xl font-bold mb-6 text-center">Register / Login</h2>
      <p class="text-gray-600 mb-6 text-center">
        Enter your phone number to receive a verification code
      </p>

      <form @submit.prevent="sendVerificationCode" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>

          <div class="flex gap-2">
            <select
              v-model="countryCode"
              class="border border-gray-300 rounded-md px-3 py-2 w-24"
            >
              <option value="+7">+7</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+49">+49</option>
            </select>

            <input
              v-model="phoneNumber"
              type="tel"
              placeholder="9012345678"
              required
              class="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <p class="text-xs text-gray-500 mt-1">Full number: {{ fullPhone }}</p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ isLoading ? 'Sending...' : 'Continue' }}
        </button>

        <p v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </p>
      </form>
    </div>

    <div v-else-if="step === 'code'">
      <h2 class="text-xl font-bold mb-6 text-center">Verify Phone</h2>
      <p class="text-gray-600 mb-6 text-center">
        We sent a verification code to <strong>{{ fullPhone }}</strong>
      </p>

      <form @submit.prevent="verifyCode" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            v-model="verificationCode"
            type="text"
            placeholder="000000"
            maxlength="6"
            autocomplete="off"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2 text-center text-2xl tracking-widest focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
        >
          {{ isLoading ? 'Verifying...' : 'Verify Code' }}
        </button>

        <button
          type="button"
          @click="
            step = 'phone';
            error = '';
          "
          class="w-full text-blue-600 text-sm hover:underline"
        >
          ← Back
        </button>

        <p v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </p>
      </form>
    </div>

    <div v-else-if="step === 'success'">
      <div class="text-center">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold mb-2">Success!</h2>
        <p class="text-gray-600 mb-4">
          You have been successfully authenticated
        </p>

        <div v-if="generatedPassword" class="bg-gray-50 p-3 rounded-md mb-4">
          <p class="text-sm text-gray-600">Your generated password:</p>
          <code class="text-sm font-mono bg-white px-2 py-1 rounded">
            {{ generatedPassword }}
          </code>
        </div>

        <p class="text-sm text-gray-500 mt-3">Redirecting to profile...</p>
      </div>
    </div>
  </div>
</template>
