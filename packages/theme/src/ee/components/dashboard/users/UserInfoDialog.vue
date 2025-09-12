<script setup lang="ts">
import { ref } from "vue"
import Dialog from "../../../../components/ui/Dialog.vue"

const isOpen = ref(false)

const staticUser = {
  name: "John Doe",
  username: "@johndoe",
  email: "john@example.com",
  roles: ["Admin", "Editor"],
  posts: 12,
  votes: 34,
  isVerified: true,
}
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
      <p><strong>Name:</strong> {{ staticUser.name }}</p>
      <p><strong>Username:</strong> {{ staticUser.username }}</p>
      <p><strong>Email:</strong> {{ staticUser.email }}</p>
      <p><strong>Roles:</strong> {{ staticUser.roles.join(", ") }}</p>
      <p><strong>Posts:</strong> {{ staticUser.posts }}</p>
      <p><strong>Votes:</strong> {{ staticUser.votes }}</p>
      <p><strong>Verified:</strong> {{ staticUser.isVerified ? "Yes" : "No" }}</p>
    </div>
  </Dialog>
</template>
