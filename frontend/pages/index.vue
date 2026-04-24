<script setup>
import Demologin from '../components/Demologin.vue';

const login = ref('admin');
const password = ref('admin123');
const userStore = useUserStore();

if (userStore.currentUser) {
  navigateTo('/profile');
}
// const handleLogin = async () => {
//   try {
//     await userStore.login(login.value, password.value);
//     await userStore.fetchMe();
//     navigateTo('/profile');
//   } catch (err) {
//     console.error('Login failed:', err);
//   }
// };
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">
        Login to Social Project
      </h1>
      <Demologin />
      <!-- <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Login</label>
          <input
            v-model="login"
            type="text"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          :disabled="userStore.loading"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ userStore.loading ? 'Loading...' : 'Login' }}
        </button>
        <div v-if="userStore.error" class="text-red-600 text-sm mt-2">
          {{ userStore.error }}
        </div>
      </form>
      <div class="mt-4 text-center text-sm text-gray-600">
        <p>Demo credentials: admin / admin123</p>
      </div> -->
    </div>
  </div>
</template>
