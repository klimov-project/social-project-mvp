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

    <UserList :users="userStore.users" @user-click="(id) => goToUser(id)" />
  </div>
</template>
