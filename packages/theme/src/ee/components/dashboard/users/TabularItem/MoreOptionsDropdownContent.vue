<template>
  <dropdown-item
    @click="useCopyText(userId)"
  >
    <template #icon>
      <copy-icon aria-hidden="true" />
    </template>

    Copy ID
  </dropdown-item>
</template>

<script setup lang="ts">
import { CopyIcon } from "lucide-vue";

import { useCopyText } from "../../../../../hooks";
import DropdownItem from "../../../../../components/ui/DropdownV2/DropdownItem.vue";

interface Props {
  userId: string;
}

defineProps<Props>();
</script>
