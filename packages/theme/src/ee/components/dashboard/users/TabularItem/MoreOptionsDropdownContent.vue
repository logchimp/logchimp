<template>
  <dropdown-item
    @click="userId ? useCopyText(userId) : undefined"
    :disabled="!userId"
  >
    <template #icon>
      <copy-icon aria-hidden="true" />
    </template>

    Copy ID
  </dropdown-item>
    <dropdown-item>

  <div class="p-6" >
    <UserInfoDialog :user="user" />
  </div>
  </dropdown-item>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { CopyIcon } from "lucide-vue";

import { useCopyText } from "../../../../../hooks";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import { userIdKey } from "./options";
import UserInfoDialog from "../../../../../ee/components/dashboard/users/UserInfoDialog.vue";
const userId = inject(userIdKey);
</script>
