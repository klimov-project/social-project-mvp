<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Login to Social Project</h1>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('admin@example.com')
const password = ref('password')
const userStore = useUserStore()

const handleLogin = async () => {
  // Mock login
  userStore.login({
    id: 'admin-id',
    name: 'admin',
    firstName: 'Admin',
    rating: 5.0,
    contacts: { email: email.value }
  })
  navigateTo('/profile')
}
</script>
