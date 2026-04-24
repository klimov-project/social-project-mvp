<script setup>
const userStore = useUserStore();
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="userStore.currentUser" class="bg-white shadow-sm p-4 mb-6">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <NuxtLink to="/profile" class="font-bold text-xl text-blue-600">
          Social Project
        </NuxtLink>
        <div class="space-x-4">
          <NuxtLink to="/profile" class="text-gray-600 hover:text-blue-600">
            Profile
          </NuxtLink>
          <NuxtLink to="/search" class="text-gray-600 hover:text-blue-600">
            Search
          </NuxtLink>
          <button
            @click="userStore.logout"
            class="text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- <header>
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header> -->

    <main class="max-w-4xl mx-auto p-4">
      <NuxtPage />
    </main>
  </div>
</template>
