<template>
  <UiDialog v-model:open="internalOpen" title="User Details" max-width="lg">
    <template #default>
      <div v-if="loading" class="bg-white/60">
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

      <div v-else-if="error" class="bg-white/60">
        <div class="flex items-center justify-center text-red-600 py-8">
          <AlertTriangleIcon aria-hidden="true" class="w-8 h-8 mr-3" />
          Failed to load user information.
        </div>
      </div>

      <div v-else-if="userInfo" class="space-y-4 bg-white/60">
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
              <MailIcon aria-hidden="true" class="w-4 h-4 mr-1 text-gray-400" />
              {{ userInfo.email }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-if="userInfo.isVerified"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"
            >
              <BadgeCheckIcon aria-hidden="true" class="w-3 h-3 mr-1" />
              Verified
            </span>
            <span 
              v-if="userInfo.isBlocked"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
            >
              <BanIcon aria-hidden="true" class="w-3 h-3 mr-1" />
              Blocked
            </span>
            <span 
              v-if="userInfo.isOwner"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"
            >
              <CrownIcon aria-hidden="true" class="w-3 h-3 mr-1" />
              Owner
            </span>
          </div>
        </div>

        <!-- Account Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-white/80 rounded-xl border border-gray-200/50">
            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <IdCardIcon aria-hidden="true" class="w-4 h-4 mr-2 text-gray-600" />
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
                  <CalendarIcon aria-hidden="true" class="w-4 h-4 mr-1 text-gray-400" />
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
              <BarChart3Icon aria-hidden="true" class="w-4 h-4 mr-2 text-gray-600" />
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
            <UsersIcon aria-hidden="true" class="w-4 h-4 mr-2 text-gray-600" />
            User Roles
          </h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="role in user.roles" 
              :key="role.id"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm"
            >
              <ShieldIcon aria-hidden="true" class="w-4 h-4 mr-1" />
              {{ role.name }}
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <Button
        type="outline"
        @click="closeDialog"
      >
        Close
      </Button>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IUser, IUserInfo } from '@logchimp/types'
import { Avatar } from '../../ui/Avatar'
import { Users } from '../../../modules/users'
import UiDialog from '../../ui/Dialog.vue'
import Button from '../../ui/Button.vue'
import {
  AlertTriangle as AlertTriangleIcon,
  Mail as MailIcon,
  BadgeCheck as BadgeCheckIcon,
  Ban as BanIcon,
  Crown as CrownIcon,
  IdCard as IdCardIcon,
  Calendar as CalendarIcon,
  BarChart3 as BarChart3Icon,
  Users as UsersIcon,
  Shield as ShieldIcon,
} from 'lucide-vue'

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

// local v-model to sync with parent prop isOpen
const internalOpen = ref(props.isOpen)
watch(() => props.isOpen, (val) => internalOpen.value = val)
watch(internalOpen, (val) => { if (!val) closeDialog() })

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
  () => [internalOpen.value, props.user?.userId],
  ([isOpen, userId]) => {
    if (isOpen && userId && typeof userId === 'string') {
      loadUserInfo(userId)
    }
  },
  { immediate: true }
)
</script>
