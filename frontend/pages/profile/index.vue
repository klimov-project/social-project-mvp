<script setup>
const userStore = useUserStore();
const verifying = ref(false);

const handleVerify = async () => {
  navigateTo('/profile/verify');
};

onMounted(async () => {
  if (!userStore.currentUser) {
    try {
      await userStore.fetchMe();
    } catch (err) {
      navigateTo('/');
    }
  }
});
</script>

<template>
  <div v-if="userStore.currentUser" class="bg-white p-8 rounded-lg shadow-md">
    <div class="flex items-center space-x-6 mb-8">
      <div
        class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600"
      >
        {{ (userStore.currentUser.account?.username || 'U')[0].toUpperCase() }}
      </div>
      <div>
        <h1 class="text-3xl font-bold">
          {{ userStore.currentUser.account?.username }}
        </h1>
        <p class="text-gray-500">@{{ userStore.currentUser.user?.login }}</p>
        <div class="mt-2 flex items-center space-x-2">
          <span class="text-yellow-500 text-xl">★</span>
          <span class="text-2xl font-semibold">{{
            parseFloat(
              userStore.currentUser.account?.reputation_score || 0,
            ).toFixed(1)
          }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border p-4 rounded-lg">
        <h2 class="font-bold mb-2">Account Info</h2>
        <p class="text-gray-600">
          Role: {{ userStore.currentUser.user?.role }}
        </p>
        <p class="text-gray-600">
          Deals Count: {{ userStore.currentUser.account?.deals_count || 0 }}
        </p>
        <p class="text-gray-600">
          Feedback:
          {{ userStore.currentUser.account?.positive_feedback_percent || 0 }}%
        </p>
      </div>
      <div class="border p-4 rounded-lg">
        <h2 class="font-bold mb-2">Bio</h2>
        <p class="text-gray-600">
          {{ userStore.currentUser.account?.bio || 'No bio yet' }}
        </p>
      </div>
    </div>

    <div class="mt-8 flex space-x-4">
      <button
        @click="handleVerify"
        :disabled="verifying"
        class="animate-pulse-slow flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-green-300 transition flex items-center justify-center"
      >
        <span v-if="verifying" class="animate-spin mr-2">↻</span>
        {{ verifying ? 'Processing...' : 'Start Verification' }}
      </button>
      <button
        @click="userStore.logout"
        class="px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
      >
        Logout
      </button>
    </div>
  </div>
</template>
