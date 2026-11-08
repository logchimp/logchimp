<template>
  <div
    :class="[
      'flex items-center gap-x-2',
      'px-3 py-1 bg-neutral-200 rounded-lg text-sm font-medium select-none',
    ]"
  >
    <span>
      {{ role.name }}
    </span>
    <ComputerIcon v-if="role.isSystem" class="size-4 stroke-neutral-500" />
  </div>
</template>

<script setup lang="ts">
import type { components } from "@logchimp/api-ts-types";
import { ComputerIcon } from "lucide-vue";

interface Props {
  role: components["schemas"]["UserItemRole"];
}

defineProps<Props>();
</script>
