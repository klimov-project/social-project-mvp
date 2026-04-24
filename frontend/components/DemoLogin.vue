<script setup>
const userStore = useUserStore();
const showPhoneAuth = ref(true);

const login = ref('admin');
const password = ref('admin123');

const handleLogin = async () => {
  try {
    await userStore.login(login.value, password.value);
    await userStore.fetchMe();
    navigateTo('/profile');
  } catch (err) {
    console.error('Login failed:', err);
  }
};


const handleRegister = async () => {
  try {
    await userStore.signUp(login.value, password.value);
    await userStore.fetchMe();
    navigateTo('/profile');
  } catch (err) {
    console.error('Register failed:', err);
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <!-- Переключатель между формами -->
    <div class="mb-4 flex gap-2">
      <button
        @click="showPhoneAuth = true"
        :class="showPhoneAuth ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
        class="px-4 py-2 rounded-md transition"
      >
        📱 Phone Login
      </button>
      <button
        @click="showPhoneAuth = false"
        :class="
          !showPhoneAuth
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
        "
        class="px-4 py-2 rounded-md transition"
      >
        🔐 Demo Login
      </button>
    </div>

    <!-- Компонент телефонной аутентификации -->
    <PhoneAuth v-if="showPhoneAuth" />

    <!-- Демо форма с логин/пароль -->
    <div v-else class="w-full">
      <h1 class="text-xl font-bold mb-6 text-center">
        Demo Login
      </h1>

      <!-- <pre style="opacity: 0.3; text-align: center;"><br>
{ login: 'user1', password: 'pass123', } 
{ login: 'user2', password: 'pass123', }
      </pre> -->
      <form @submit.prevent="handleLogin" class="space-y-4">
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
      <button
        class="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
        @click="handleRegister"
      >
        Register
      </button>
    </div>
  </div>
</template>
