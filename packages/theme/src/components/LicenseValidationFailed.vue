<script setup lang="ts">
import { KeyIcon } from "lucide-vue";

defineProps<{
  resourceType: "posts" | "boards" | "roadmaps" | "roles";
}>();
</script>

<template>
  <div
    class="border border-dashed border-red-300/80 rounded-lg p-4 text-center flex flex-col items-center gap-y-2.5"
  >
    <KeyIcon class="stroke-red-600" />
    <p class="mb-1 font-medium">License issue</p>
    <span
      class="text-neutral-600 text-sm"
    >
      We are unable to display {{resourceType}} due to a license validation failure.
    </span>
  </div>
</template>
