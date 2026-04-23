<script setup>
const userStore = useUserStore();
const searchQuery = ref('');

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    await userStore.fetchUsers(searchQuery.value);
  }
};

const goToUser = (userId) => {
  navigateTo(`/user/${userId}`);
};

onMounted(async () => {
  if (!userStore.currentUser) {
    try {
      await userStore.fetchMe();
      await userStore.fetchUsers();
    } catch (err) {
      navigateTo('/');
    }
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-4">Search Users</h1>
      <div class="flex gap-2">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Search by username or login..."
          class="flex-1 border border-gray-300 rounded-md p-2"
        />
        <button
          @click="handleSearch"
          :disabled="userStore.loading"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ userStore.loading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </div>

    <div
      v-if="userStore.error"
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
    >
      {{ userStore.error }}
    </div>

    <div v-if="userStore.users.length > 0" class="space-y-4">
      <h2 class="text-xl font-bold">Results ({{ userStore.users.length }})</h2>
      <div
        v-for="user in userStore.users"
        :key="user.id"
        class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
        @click="goToUser(user.id)"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg">
              {{ user.account?.username || user.login }}
            </h3>
            <p class="text-gray-600">@{{ user.login }}</p>
            <p v-if="user.account?.bio" class="text-gray-500 text-sm mt-1">
              {{ user.account.bio }}
            </p>
          </div>
          <div class="text-right">
            <div class="flex items-center space-x-1">
              <span class="text-yellow-500">★</span>
              <span class="font-semibold">{{
                parseFloat(user.account?.reputation_score || 0).toFixed(1)
              }}</span>
            </div>
            <p class="text-gray-600 text-sm">
              Deals: {{ user.account?.deals_count || 0 }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!userStore.loading && searchQuery"
      class="text-center py-8 text-gray-600"
    >
      No users found matching your search.
    </div>
  </div>
</template>
