<template>
  <div v-if="user" class="bg-white p-8 rounded-lg shadow-md">
    <div class="flex items-center space-x-6 mb-8">
      <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
        {{ user.firstName[0] }}
      </div>
      <div>
        <h1 class="text-3xl font-bold">{{ user.firstName }}</h1>
        <p class="text-gray-500">@{{ user.name }}</p>
        <div class="mt-2 flex items-center space-x-2">
          <span class="text-yellow-500 text-xl">★</span>
          <span :class="{ 'blur-sm select-none': !unlocked }" class="text-2xl font-semibold">
            {{ unlocked ? user.rating.toFixed(1) : '?.?' }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="!unlocked" class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
      <h2 class="text-xl font-bold mb-4">Profile Locked</h2>
      <p class="text-gray-600 mb-8">Unlock this profile to see full reputation details and contact information.</p>
      <button @click="handleUnlock" :disabled="unlocking" class="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center mx-auto">
        <span v-if="unlocking" class="animate-spin mr-2">↻</span>
        {{ unlocking ? 'Processing Payment...' : 'Unlock Profile (Mock Payment)' }}
      </button>
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="border p-4 rounded-lg">
          <h2 class="font-bold mb-2">Contacts</h2>
          <p class="text-gray-600">Email: {{ user.contacts.email }}</p>
          <p v-if="user.contacts.telegram" class="text-gray-600">Telegram: {{ user.contacts.telegram }}</p>
        </div>
        <div class="border p-4 rounded-lg">
          <h2 class="font-bold mb-2">Reputation</h2>
          <p class="text-gray-600">Deposit: ${{ user.deposit }}</p>
          <p class="text-gray-600">Member since: {{ new Date(user.createdAt).toLocaleDateString() }}</p>
        </div>
      </div>

      <div class="border-t pt-8">
        <h2 class="text-xl font-bold mb-4">Leave Feedback</h2>
        <div class="flex items-center space-x-4 mb-6">
          <button v-for="star in 5" :key="star" @click="feedbackRating = star" class="text-3xl transition" :class="star <= feedbackRating ? 'text-yellow-500' : 'text-gray-300'">
            ★
          </button>
        </div>
        <textarea v-model="feedbackText" placeholder="Write your feedback here..." class="w-full border border-gray-300 rounded-md p-4 mb-4 h-32"></textarea>
        <button @click="submitFeedback" :disabled="submittingFeedback || feedbackRating === 0" class="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-green-300 transition">
          {{ submittingFeedback ? 'Submitting...' : 'Submit Feedback' }}
        </button>
      </div>
    </div>

    <div v-if="showToast" class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const userStore = useUserStore()
const user = ref(null)
const unlocked = ref(false)
const unlocking = ref(false)
const feedbackRating = ref(0)
const feedbackText = ref('')
const submittingFeedback = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const handleUnlock = async () => {
  unlocking.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  unlocked.value = true
  unlocking.value = false
  showToast.value = true
  toastMessage.value = 'Profile unlocked!'
  setTimeout(() => showToast.value = false, 3000)
}

const submitFeedback = async () => {
  submittingFeedback.value = true
  try {
    const delta = (feedbackRating.value - 3) * 0.5 // Mock logic: 5 stars = +1, 1 star = -1
    await userStore.leaveFeedback(user.value.id, delta)
    toastMessage.value = 'Feedback submitted!'
    showToast.value = true
    feedbackRating.value = 0
    feedbackText.value = ''
    // Refresh user data
    user.value = await userStore.fetchUserById(route.params.slug)
    setTimeout(() => showToast.value = false, 3000)
  } finally {
    submittingFeedback.value = false
  }
}

onMounted(async () => {
  user.value = await userStore.fetchUserById(route.params.slug)
})
</script>
