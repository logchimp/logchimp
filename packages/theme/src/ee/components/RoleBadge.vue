<template>
  <div class="px-3 py-1 bg-neutral-200 rounded-lg text-sm font-medium select-none">
    {{role.name}}
  </div>
</template>

<script setup lang="ts">
import type { IRole } from "@logchimp/types";

interface Props {
  role: IRole;
}

defineProps<Props>();
</script>
