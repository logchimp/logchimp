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

    <div class="space-y-3">
      <p><strong>Name:</strong> {{ props.user.name || props.user.username }}</p>
      <p><strong>Username:</strong> {{ props.user.username }}</p>
      <p><strong>Email:</strong> {{ props.user.email }}</p>
      <p><strong>Roles:</strong> {{ props.user.roles.map(r => r.name).join(", ") }}</p>
      <p><strong>Posts:</strong> {{ props.user.posts }}</p>
      <p><strong>Votes:</strong> {{ props.user.votes }}</p>
      <p><strong>Verified:</strong> {{ props.user.isVerified ? "Yes" : "No" }}</p>
    </div>
  </Dialog>
</template>
