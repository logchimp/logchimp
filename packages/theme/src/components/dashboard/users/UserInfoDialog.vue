<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop with blur -->
    <div 
      class="absolute inset-0 bg-black/30 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-200">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-2xl">
        <h2 class="text-xl font-semibold text-gray-900">User Details</h2>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full p-2 transition-all duration-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div v-if="loading" class="p-6 bg-white/60">
        <div class="animate-pulse space-y-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-32"></div>
              <div class="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="p-6 bg-white/60">
        <div class="flex items-center justify-center text-red-600 py-8">
          <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Failed to load user information.
        </div>
      </div>

      <div v-else-if="userInfo" class="p-6 space-y-4 bg-white/60">
        <!-- User Profile Section -->
        <div class="flex items-start space-x-4 p-4 bg-white/80 rounded-xl border border-gray-200/50">
          <div class="flex-shrink-0">
            <Avatar 
              :src="userInfo.avatar || ''" 
              :name="userInfo.name || userInfo.username"
              class="w-20 h-20"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ userInfo.name || userInfo.username }}</h3>
            <p class="text-gray-600 font-medium">@{{ userInfo.username }}</p>
            <p class="text-sm text-gray-500 flex items-center mt-1">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              {{ userInfo.email }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-if="userInfo.isVerified"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Verified
            </span>
            <span 
              v-if="userInfo.isBlocked"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
              </svg>
              Blocked
            </span>
            <span 
              v-if="userInfo.isOwner"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 01-.992 1.736L3 15.152l-1.254.716a1 1 0 01-.992-1.736L2 13.277V12a1 1 0 011-1zm14 0a1 1 0 011 1v1.277l-1.254.716a1 1 0 01-.992-1.736L17 13.277V12a1 1 0 011-1zm-9.618 4.504a1 1 0 01.372 1.364l-1.75 1a1 1 0 01-.992 0l-1.75-1A1 1 0 014.636 15.5L6 16.327l1.364-.827a1 1 0 011.018.004zm6.236 0a1 1 0 011.018-.004L16 16.327l1.364-.827a1 1 0 111.018 1.708l-1.75 1a1 1 0 01-.992 0l-1.75-1a1 1 0 01.372-1.364z" clip-rule="evenodd" />
              </svg>
              Owner
            </span>
          </div>
        </div>

        <!-- Account Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-white/80 rounded-xl border border-gray-200/50">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m0 0V4a2 2 0 114 0v2" />
              </svg>
              Account Information
            </h4>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs uppercase font-medium text-gray-500 tracking-wide">User ID</dt>
                <dd class="text-sm font-mono text-gray-900 mt-1 bg-gray-100 px-2 py-1 rounded">{{ userInfo.userId }}</dd>
              </div>
              <div>
                <dt class="text-xs uppercase font-medium text-gray-500 tracking-wide">Joined</dt>
                <dd class="text-sm text-gray-900 mt-1 flex items-center">
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(userInfo.createdAt) }}
                </dd>
              </div>
              <div v-if="userInfo.notes">
                <dt class="text-xs uppercase font-medium text-gray-500 tracking-wide">Notes</dt>
                <dd class="text-sm text-gray-900 mt-1 bg-gray-50 px-3 py-2 rounded-lg">{{ userInfo.notes }}</dd>
              </div>
            </dl>
          </div>

          <div class="p-4 bg-white/80 rounded-xl border border-gray-200/50">
            <h4 class="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Activity Stats
            </h4>
            <dl class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <dt class="text-sm font-medium text-blue-900">Posts Created</dt>
                <dd class="text-lg font-bold text-blue-600">{{ user?.posts || 0 }}</dd>
              </div>
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <dt class="text-sm font-medium text-green-900">Votes Cast</dt>
                <dd class="text-lg font-bold text-green-600">{{ user?.votes || 0 }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Roles Section -->
        <div v-if="user?.roles?.length" class="p-4 bg-white/80 rounded-xl border border-gray-200/50">
          <h4 class="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            User Roles
          </h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="role in user.roles" 
              :key="role.id"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm"
            >
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              {{ role.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-b-2xl">
        <button
          @click="closeDialog"
          class="px-6 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IUser, IUserInfo } from '@logchimp/types'
import { Avatar } from '../../ui/Avatar'
import { Users } from '../../../modules/users'

interface Props {
  user: IUser | null
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const usersApi = new Users()
const userInfo = ref<IUserInfo | null>(null)
const loading = ref(false)
const error = ref(false)

const closeDialog = () => {
  emit('close')
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadUserInfo = async (userId: string) => {
  if (!userId) return
  
  loading.value = true
  error.value = false
  
  try {
    const response = await usersApi.getById(userId)
    userInfo.value = response.user
  } catch (err) {
    console.error('Failed to load user info:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Load user info when dialog opens and user changes
watch(
  () => [props.isOpen, props.user?.userId],
  ([isOpen, userId]) => {
    if (isOpen && userId && typeof userId === 'string') {
      loadUserInfo(userId)
    }
  },
  { immediate: true }
)
</script>
