<template>
  <div class="bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6">Search Users</h1>
    <div class="flex space-x-4 mb-8">
      <input v-model="searchQuery" @input="handleSearch" placeholder="Search by name or ID..." class="flex-grow border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
      <button @click="handleSearch" class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
        Search
      </button>
    </div>

    <div v-if="userStore.loading" class="text-center py-12">
      <div class="animate-spin text-4xl text-blue-600">↻</div>
      <p class="mt-4 text-gray-500">Searching users...</p>
    </div>

    <div v-else-if="userStore.users.length === 0" class="text-center py-12 text-gray-500">
      No users found matching your search.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="user in userStore.users" :key="user.id" @click="navigateTo(`/user/${user.id}`)" class="border p-4 rounded-lg hover:border-blue-500 cursor-pointer transition flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
            {{ user.firstName[0] }}
          </div>
          <div>
            <h3 class="font-bold">{{ user.firstName }}</h3>
            <p class="text-sm text-gray-500">@{{ user.name }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-1">
          <span class="text-yellow-500">★</span>
          <span class="font-semibold">{{ user.rating.toFixed(1) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const userStore = useUserStore()
const searchQuery = ref('')

const handleSearch = async () => {
  await userStore.fetchUsers(searchQuery.value)
}

onMounted(() => {
  userStore.fetchUsers()
})
</script>
