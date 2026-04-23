<script setup>
const route = useRoute();
const userStore = useUserStore();
const user = ref(null);
const ratingLoading = ref(false);

const handleRating = async () => {
  ratingLoading.value = true;
  try {
    await userStore.boostRating(route.params.slug);
    alert('Rating updated successfully!');
  } catch (err) {
    console.error('Rating failed:', err);
    alert('Failed to update rating');
  } finally {
    ratingLoading.value = false;
  }
};

onMounted(async () => {
  if (!userStore.currentUser) {
    try {
      await userStore.fetchMe();
    } catch (err) {
      navigateTo('/');
      return;
    }
  }

  try {
    user.value = await userStore.fetchUserById(route.params.slug);
  } catch (err) {
    console.error('Failed to load user:', err);
    navigateTo('/search');
  }
});
</script>

<template>
  <div v-if="user" class="bg-white p-8 rounded-lg shadow-md">
    <div class="flex items-center space-x-6 mb-8">
      <div
        class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600"
      >
        {{ (user.account?.username || 'U')[0].toUpperCase() }}
      </div>
      <div>
        <h1 class="text-3xl font-bold">{{ user.account?.username }}</h1>
        <p class="text-gray-500">@{{ user.login }}</p>
        <div class="mt-2 flex items-center space-x-2">
          <span class="text-yellow-500 text-xl">★</span>
          <span class="text-2xl font-semibold">{{
            parseFloat(user.account?.reputation_score || 0).toFixed(1)
          }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border p-4 rounded-lg">
        <h2 class="font-bold mb-2">Account Info</h2>
        <p class="text-gray-600">Role: {{ user.user?.role }}</p>
        <p class="text-gray-600">
          Deals Count: {{ user.account?.deals_count || 0 }}
        </p>
        <p class="text-gray-600">
          Feedback: {{ user.account?.positive_feedback_percent || 0 }}%
        </p>
      </div>
      <div class="border p-4 rounded-lg">
        <h2 class="font-bold mb-2">Bio</h2>
        <p class="text-gray-600">{{ user.account?.bio || 'No bio yet' }}</p>
      </div>
    </div>

    <div class="mt-8 flex space-x-4">
      <button
        @click="handleRating"
        :disabled="ratingLoading"
        class="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-green-300 transition"
      >
        <span v-if="ratingLoading" class="animate-spin mr-2">↻</span>
        {{ ratingLoading ? 'Processing...' : 'Leave Rating' }}
      </button>
      <NuxtLink
        to="/search"
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
      >
        Back to Search
      </NuxtLink>
    </div>
  </div>
  <div v-else class="text-center py-8">
    <p class="text-gray-600">Loading user profile...</p>
  </div>
</template>
