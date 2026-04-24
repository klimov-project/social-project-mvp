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

// Вычисляемые свойства для удобства
const fullName = computed(() => {
  const v = userStore.currentUser?.account?.verifications;
  if (!v?.fullName) return null;
  const { lastName, firstName, patronymic } = v.fullName;
  return [lastName, firstName, patronymic].filter(Boolean).join(' ');
});

const verificationStatus = computed(() => {
  const v = userStore.currentUser?.account?.verifications;
  if (!v || Object.keys(v).length === 0) {
    return 'not_started';
  }
  return v.status || (v.verifiedAt ? 'verified' : 'pending');
});

const verifiedAt = computed(() => {
  const v = userStore.currentUser?.account?.verifications?.verifiedAt;
  if (!v) return null;
  return new Date(v).toLocaleString('ru-RU');
});
</script>

<template>
  <div v-if="userStore.currentUser" class="bg-white rounded-lg shadow-md">
    <!-- Шапка профиля с аватаром -->
    <div
      class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg p-6 text-white"
    >
      <div class="flex items-center space-x-6">
        <div
          class="w-28 h-28 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white"
        >
          {{
            (userStore.currentUser.account?.username || 'U')[0].toUpperCase()
          }}
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold">
                {{ userStore.currentUser.account?.username }}
              </h1>
              <p class="text-blue-100">
                @{{ userStore.currentUser.user?.login }}
              </p>
            </div>
            <div class="bg-white/20 backdrop-blur rounded-full px-4 py-2">
              <span class="font-semibold">{{
                userStore.currentUser.user?.role
              }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-4 mt-4">
            <div class="flex items-center space-x-2">
              <span class="text-yellow-300 text-2xl">★</span>
              <span class="text-2xl font-bold">{{
                parseFloat(
                  userStore.currentUser.account?.reputation_score || 0,
                ).toFixed(1)
              }}</span>
            </div>
            <div class="text-sm text-blue-100">
              Based on
              {{ userStore.currentUser.account?.deals_count || 0 }} deals
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Статус верификации -->
      <div
        class="flex items-center justify-between p-4 rounded-lg"
        :class="{
          'bg-green-50 border border-green-200':
            verificationStatus === 'verified',
          'bg-yellow-50 border border-yellow-200':
            verificationStatus === 'pending',
          'bg-gray-50 border border-gray-200':
            verificationStatus === 'not_started',
        }"
      >
        <div class="flex items-center space-x-3">
          <span class="text-2xl">
            {{
              verificationStatus === 'verified'
                ? '✅'
                : verificationStatus === 'pending'
                ? '⏳'
                : '⚠️'
            }}
          </span>
          <div>
            <p class="font-semibold">
              {{
                verificationStatus === 'verified'
                  ? 'Verified Account'
                  : verificationStatus === 'pending'
                  ? 'Verification Pending'
                  : 'Verification Required'
              }}
            </p>
            <p v-if="verifiedAt" class="text-sm text-gray-500">
              Verified on {{ verifiedAt }}
            </p>
            <p
              v-else-if="verificationStatus === 'pending'"
              class="text-sm text-yellow-600"
            >
              Your documents are being reviewed
            </p>
            <p v-else class="text-sm text-gray-500">
              Complete verification to increase trust score
            </p>
          </div>
        </div>
        <button
          v-if="verificationStatus !== 'verified'"
          @click="handleVerify"
          :disabled="verifying"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition text-sm font-medium"
        >
          {{ verifying ? 'Processing...' : 'Verify Now' }}
        </button>
      </div>

      <!-- Основная информация в сетке -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Личная информация -->
        <div class="border rounded-lg p-4">
          <h2 class="font-bold text-lg mb-3 flex items-center gap-2">
            👤 Personal Information
          </h2>
          <div class="space-y-2">
            <p v-if="fullName" class="text-gray-700">
              <span class="font-medium">Full Name:</span> {{ fullName }}
            </p>
            <p v-if="userStore.currentUser.account?.bio" class="text-gray-700">
              <span class="font-medium">Bio:</span>
              {{ userStore.currentUser.account.bio }}
            </p>
            <p v-else class="text-gray-400 italic">No bio yet</p>
          </div>
        </div>

        <!-- Статистика -->
        <div class="border rounded-lg p-4">
          <h2 class="font-bold text-lg mb-3 flex items-center gap-2">
            📊 Statistics
          </h2>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Deals:</span>
              <span class="font-semibold">{{
                userStore.currentUser.account?.deals_count || 0
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Positive Feedback:</span>
              <div class="flex items-center gap-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 rounded-full h-2"
                    :style="{
                      width: `${
                        userStore.currentUser.account
                          ?.positive_feedback_percent || 0
                      }%`,
                    }"
                  ></div>
                </div>
                <span class="font-semibold"
                  >{{
                    userStore.currentUser.account?.positive_feedback_percent ||
                    0
                  }}%</span
                >
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Account Status:</span>
              <span
                :class="
                  userStore.currentUser.user?.is_active
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                class="font-semibold"
              >
                {{
                  userStore.currentUser.user?.is_active ? 'Active' : 'Inactive'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Верифицированные контакты -->
      <div
        v-if="userStore.currentUser.account?.verifications?.contacts"
        class="border rounded-lg p-4"
      >
        <h2 class="font-bold text-lg mb-3 flex items-center gap-2">
          📞 Verified Contacts
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-if="userStore.currentUser.account.verifications.contacts.email"
            class="flex items-center gap-2 text-gray-700"
          >
            <span>📧</span>
            <span>{{
              userStore.currentUser.account.verifications.contacts.email
            }}</span>
          </div>
          <div
            v-if="userStore.currentUser.account.verifications.contacts.phone"
            class="flex items-center gap-2 text-gray-700"
          >
            <span>📱</span>
            <span
              >{{
                userStore.currentUser.account.verifications.contacts
                  .countryCode || ''
              }}
              {{
                userStore.currentUser.account.verifications.contacts.phone
              }}</span
            >
          </div>
          <div
            v-if="userStore.currentUser.account.verifications.contacts.telegram"
            class="flex items-center gap-2 text-gray-700"
          >
            <span>💬</span>
            <span
              >@{{
                userStore.currentUser.account.verifications.contacts.telegram
              }}</span
            >
          </div>
        </div>
      </div>

      <!-- Паспортные данные (если есть) -->
      <div
        v-if="userStore.currentUser.account?.verifications?.passport"
        class="border rounded-lg p-4"
      >
        <h2 class="font-bold text-lg mb-3 flex items-center gap-2">
          🛂 Passport Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span class="font-medium">Series:</span>
            {{
              userStore.currentUser.account.verifications.passport.series || '—'
            }}
          </div>
          <div>
            <span class="font-medium">Number:</span>
            {{
              userStore.currentUser.account.verifications.passport.number || '—'
            }}
          </div>
          <div class="md:col-span-2">
            <span class="font-medium">Issued By:</span>
            {{
              userStore.currentUser.account.verifications.passport.issuedBy ||
              '—'
            }}
          </div>
          <div>
            <span class="font-medium">Date of Issue:</span>
            {{
              userStore.currentUser.account.verifications.passport
                .dateOfIssue || '—'
            }}
          </div>
        </div>
        <div
          v-if="userStore.currentUser.account.verifications.passport.photo"
          class="mt-3"
        >
          <button
            @click="
              () => {
                const img = new Image();
                img.src =
                  userStore.currentUser.account.verifications.passport.photo;
                window.open().document.write(img.outerHTML);
              }
            "
            class="text-blue-600 text-sm hover:underline"
          >
            View Passport Photo →
          </button>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex space-x-4 pt-4">
        <button
          @click="handleVerify"
          :disabled="verifying"
          class="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-green-300 transition flex items-center justify-center gap-2"
        >
          <span v-if="verifying" class="animate-spin">↻</span>
          {{
            verifying
              ? 'Processing...'
              : verificationStatus === 'verified'
              ? 'Update Verification'
              : 'Start Verification'
          }}
        </button>
        <!-- <button
          @click="userStore.logout"
          class="px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
        >
          Logout
        </button> -->
      </div>
    </div>
  </div>
</template>
