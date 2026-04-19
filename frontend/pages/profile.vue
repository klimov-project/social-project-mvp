<template>
  <div v-if="userStore.currentUser" class="bg-white p-8 rounded-lg shadow-md">
    <div class="flex items-center space-x-6 mb-8">
      <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
        {{ userStore.currentUser.firstName[0] }}
      </div>
      <div>
        <h1 class="text-3xl font-bold">{{ userStore.currentUser.firstName }}</h1>
        <p class="text-gray-500">@{{ userStore.currentUser.name }}</p>
        <div class="mt-2 flex items-center space-x-2">
          <span class="text-yellow-500 text-xl">★</span>
          <span class="text-2xl font-semibold">{{ userStore.currentUser.rating.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border p-4 rounded-lg">
        <h2 class="font-bold mb-2">Contacts</h2>
        <p class="text-gray-600">Email: {{ userStore.currentUser.contacts.email }}</p>
        <p v-if="userStore.currentUser.contacts.telegram" class="text-gray-600">Telegram: {{ userStore.currentUser.contacts.telegram }}</p>
      </div>
      <div class="border p-4 rounded-lg">
        <h2 class="font-bold mb-2">Referral Link</h2>
        <div class="flex items-center space-x-2">
          <input readonly :value="referralLink" class="bg-gray-50 border p-2 rounded flex-grow text-sm" />
          <button @click="copyReferral" class="bg-blue-100 text-blue-600 px-3 py-2 rounded hover:bg-blue-200">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-8 flex space-x-4">
      <button @click="handleBoost" :disabled="boosting" class="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-green-300 transition flex items-center justify-center">
        <span v-if="boosting" class="animate-spin mr-2">↻</span>
        {{ boosting ? 'Processing Payment...' : 'Boost Rating (+1.0)' }}
      </button>
      <button @click="userStore.logout" class="px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition">
        Logout
      </button>
    </div>
    
    <div v-if="showToast" class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
      Rating boosted successfully!
    </div>
  </div>
</template>

<script setup>
const userStore = useUserStore()
const boosting = ref(false)
const showToast = ref(false)
const copied = ref(false)

const referralLink = computed(() => `http://localhost:3000/ref?user=${userStore.currentUser.id}`)

const copyReferral = () => {
  navigator.clipboard.writeText(referralLink.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const handleBoost = async () => {
  boosting.value = true
  // Mock payment delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  try {
    await userStore.boostRating(userStore.currentUser.id)
    showToast.value = true
    setTimeout(() => showToast.value = false, 3000)
  } finally {
    boosting.value = false
  }
}

onMounted(() => {
  if (!userStore.currentUser) navigateTo('/')
})
</script>
