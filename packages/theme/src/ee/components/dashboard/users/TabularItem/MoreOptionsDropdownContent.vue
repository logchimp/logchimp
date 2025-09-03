<template>
  <dropdown-item @click="openUserDialog">
    <template #icon>
      <EyeIcon aria-hidden="true" />
    </template>
    View details
  </dropdown-item>

  <dropdown-item
    @click="userId ? useCopyText(userId) : undefined"
    :disabled="!userId"
  >
    <template #icon>
      <copy-icon aria-hidden="true" />
    </template>

    Copy ID
  </dropdown-item>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { CopyIcon, EyeIcon } from "lucide-vue";

import { useCopyText } from "../../../../../hooks";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";
import { userIdKey, openUserDialogKey } from "./options";

const userId = inject(userIdKey);
const openUserDialog = inject(openUserDialogKey);
</script>
