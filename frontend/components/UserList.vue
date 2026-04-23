<script setup>
const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['user-click']);

const sortField = ref('reputation_score');
const sortOrder = ref('desc'); // desc = сначала лучшие

// Сортировка
const sortedUsers = computed(() => {
  if (!props.users.length) return [];

  return [...props.users].sort((a, b) => {
    let aVal = a[sortField.value];
    let bVal = b[sortField.value];

    // Преобразуем строковые числа в числа
    if (sortField.value === 'reputation_score') {
      aVal = parseFloat(aVal || 0);
      bVal = parseFloat(bVal || 0);
    }

    if (sortOrder.value === 'desc') {
      return bVal - aVal;
    } else {
      return aVal - bVal;
    }
  });
});

// Цвет аватара в зависимости от рейтинга
const getAvatarColor = (score) => {
  const rating = parseFloat(score || 0);
  if (rating >= 4.5) return 'bg-green-100 text-green-700';
  if (rating >= 3.5) return 'bg-blue-100 text-blue-700';
  if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

// Есть ли верифицированные контакты
const hasVerifiedContacts = (user) => {
  const contacts = user.verifications?.contacts;
  if (!contacts) return false;
  return !!(contacts.email || contacts.phone || contacts.telegram);
};

// Форматирование даты
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Сортировка
const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc';
  } else {
    sortField.value = field;
    sortOrder.value = 'desc';
  }
};

// Переход к пользователю
const goToUser = (id) => {
  emit('user-click', id);
};
</script>

<template>
  <div v-if="users.length > 0" class="space-y-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Users ({{ users.length }})</h2>
      <div class="flex gap-2">
        <button
          @click="sortBy('reputation_score')"
          class="text-sm text-gray-500 hover:text-gray-700"
          :class="{
            'text-blue-600 font-semibold': sortField === 'reputation_score',
          }"
        >
          Sort by Rating
          {{
            sortField === 'reputation_score' && sortOrder === 'desc' ? '↓' : '↑'
          }}
        </button>
        <button
          @click="sortBy('deals_count')"
          class="text-sm text-gray-500 hover:text-gray-700"
          :class="{
            'text-blue-600 font-semibold': sortField === 'deals_count',
          }"
        >
          Sort by Deals
          {{ sortField === 'deals_count' && sortOrder === 'desc' ? '↓' : '↑' }}
        </button>
      </div>
    </div>

    <div
      v-for="user in sortedUsers"
      :key="user.id"
      class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
      @click="goToUser(user.id)"
    >
      <div class="p-4">
        <div class="flex items-start justify-between">
          <!-- Левая часть: аватар + информация -->
          <div class="flex items-start space-x-4 flex-1">
            <!-- Аватар -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              :class="getAvatarColor(user.reputation_score)"
            >
              {{ (user.username || 'U')[0].toUpperCase() }}
            </div>

            <!-- Информация о пользователе -->
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-lg">
                  {{ user.username }}
                </h3>
                <!-- Бейдж верификации -->
                <span
                  v-if="user.verifications?.status === 'verified'"
                  class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                >
                  ✓ Verified
                </span>
                <span
                  v-else-if="user.verifications?.status === 'pending'"
                  class="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full"
                >
                  ⏳ Pending
                </span>
                <!-- Бейдж админа -->
                <span
                  v-if="user.role === 'ADMIN'"
                  class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                >
                  Admin
                </span>
              </div>

              <p class="text-gray-500 text-sm">ID: {{ user.id }}</p>

              <!-- Контакты (иконками) -->
              <div
                v-if="hasVerifiedContacts(user)"
                class="flex items-center gap-2 mt-2 text-gray-400 text-xs"
              >
                <span
                  v-if="user.verifications?.contacts?.email"
                  title="Email verified"
                  >📧</span
                >
                <span
                  v-if="user.verifications?.contacts?.phone"
                  title="Phone verified"
                  >📱</span
                >
                <span
                  v-if="user.verifications?.contacts?.telegram"
                  title="Telegram"
                  >💬</span
                >
                <span
                  v-if="user.verifications?.passport"
                  title="Passport verified"
                  >🛂</span
                >
              </div>

              <!-- Bio -->
              <p
                v-if="user.bio"
                class="text-gray-600 text-sm mt-2 line-clamp-1"
              >
                {{ user.bio }}
              </p>
            </div>
          </div>

          <!-- Правая часть: рейтинг и сделки -->
          <div class="text-right flex-shrink-0 ml-4">
            <div class="flex items-center space-x-1">
              <span class="text-yellow-500 text-lg">★</span>
              <span class="font-bold text-lg">
                {{ parseFloat(user.reputation_score || 0).toFixed(1) }}
              </span>
            </div>
            <div class="text-gray-500 text-sm mt-1">
              📊 {{ user.deals_count || 0 }} deals
            </div>
            <div
              class="text-green-600 text-sm font-medium mt-1"
              v-if="user.positive_feedback_percent"
            >
              👍 {{ user.positive_feedback_percent }}%
            </div>
          </div>
        </div>

        <!-- Дополнительная информация (расширяемая) -->
        <div
          v-if="user.verifications?.fullName"
          class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-4"
        >
          <span
            >👤
            {{
              [
                user.verifications.fullName.lastName,
                user.verifications.fullName.firstName,
              ]
                .filter(Boolean)
                .join(' ')
            }}</span
          >
          <span>📅 Joined: {{ formatDate(user.created_at) }}</span>
        </div>
        <div
          v-else
          class="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-end"
        >
          <span>📅 Joined: {{ formatDate(user.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
    <p class="text-gray-500">No users found</p>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
