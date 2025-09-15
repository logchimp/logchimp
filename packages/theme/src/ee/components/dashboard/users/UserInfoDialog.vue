<script setup lang="ts">
import { ref } from "vue"
import Dialog from "../../../../components/ui/Dialog.vue"
import type { IUser } from "@logchimp/types"

interface Props {
  user: IUser
}

const props = defineProps<Props>()
const isOpen = ref(false)
</script>

<template>
  <!-- Trigger -->
  <button
    class="ml-auto text-gray-600 hover:text-black"
    @click="isOpen = true"
  >
    👁
  </button>

  <!-- Dialog -->
  <Dialog v-model:open="isOpen">
    <template #title>User Information</template>
    <template #description>Details about the user</template>
<div class="space-y-4">
  <dl class="divide-y divide-gray-200">
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Name</dt>
      <dd class="col-span-2 text-gray-900">{{ props.user.name || props.user.username }}</dd>
    </div>
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Username</dt>
      <dd class="col-span-2 text-gray-900">{{ props.user.username }}</dd>
    </div>
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Email</dt>
      <dd class="col-span-2 text-gray-900">{{ props.user.email }}</dd>
    </div>
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Roles</dt>
      <dd class="col-span-2 text-gray-900">{{ props.user.roles.map(r => r.name).join(", ") }}</dd>
    </div>
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Posts</dt>
      <dd class="col-span-2 text-gray-900">{{ props.user.posts }}</dd>
    </div>
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Votes</dt>
      <dd class="col-span-2 text-gray-900">{{ props.user.votes }}</dd>
    </div>
    <div class="py-2 grid grid-cols-3 gap-4">
      <dt class="font-medium text-gray-700">Verified</dt>
      <dd class="col-span-2">
        <span
          :class="props.user.isVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'"
        >
          {{ props.user.isVerified ? "Yes" : "No" }}
        </span>
      </dd>
    </div>
  </dl>
</div>
  <button
    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
    @click="isOpen = false"
  >
    Close
  </button>
  </Dialog>
</template>
