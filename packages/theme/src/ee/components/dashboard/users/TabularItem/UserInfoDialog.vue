<script setup lang="ts">
import { ref } from "vue"
import Dialog from "../../../../../components/ui/Dialog.vue"
import type { IUser } from "@logchimp/types"

interface Props {
  user: IUser
}
import { Eye, CircleUserRound , Activity, Users  } from "lucide-vue"

const props = defineProps<Props>()
const isOpen = ref(false)
</script>

<template>
  <button
    class="ml-auto rounded-full p-1.5 hover:bg-gray-100 text-gray-600 hover:text-black transition"
    @click="isOpen = true"
  >
    <Eye size ="18"/>
  </button>

  <Dialog v-model:open="isOpen" class="max-w-2xl w-full">
    <template #title>User Details</template>

    <div class="space-y-4">
      <div class="flex items-center justify-between p-2 border border-gray-200 rounded-md">
        <div class="flex items-center space-x-3">
          <img
            v-if="props.user.avatar"
            :src="props.user.avatar"
            alt="Avatar"
            class="w-10 h-10 rounded-full "
          />
          <div>
            <h2 class="text-base font-semibold text-gray-900">{{ props.user.name }}</h2>
            <p class="text-xs text-gray-600">@{{ props.user.username }}</p>
            <p class="text-xs text-gray-500">{{ props.user.email }}</p>
          </div>
        </div>
        <span
          class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-purple-100 text-purple-700"
        >
          {{ props.user.isOwner ? "Owner" : "Member" }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
          <h3 class="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <span><CircleUserRound size ="16"/></span><span>Account Information</span>
          </h3>
          <dl class="space-y-1 text-xs">
            <div>
              <dt class="font-medium text-gray-500">User ID</dt>
              <dd class="mt-0.5 font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                {{ props.user.userId }}
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500">Joined</dt>
              <dd class="mt-0.5 text-gray-800">
                {{ props.user.createdAt}}
              </dd>
            </div>
          </dl>
        </div>

        <div class="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
          <h3 class="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <span><Activity size ="16"/></span><span>Activity Stats</span>
          </h3>
          <ul class="space-y-1 text-xs">
            <li class="flex justify-between p-1.5 rounded bg-blue-50">
              <span class="text-blue-700 font-medium">Posts Created</span>
              <span class="font-semibold text-blue-700">{{ props.user.posts }}</span>
            </li>
            <li class="flex justify-between p-1.5 rounded bg-green-50">
              <span class="text-green-700 font-medium">Votes Cast</span>
              <span class="font-semibold text-green-700">{{ props.user.votes }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="p-3 border border-gray-200 rounded-md bg-white shadow-sm">
        <h3 class="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
          <span><Users size ="16"/></span><span>User Roles</span>
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="role in props.user.roles"
            :key="role.id"
            class="px-2 py-0.5 text-[11px] rounded bg-blue-100 text-blue-700 font-medium"
          >
            {{ role.name }}
          </span>
        </div>
      </div>

    
    </div>
    <template #footer>
      <button
        class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-xs"
        @click="isOpen = false"
      >
        Close
      </button>
    </template>
  </Dialog>
</template>
