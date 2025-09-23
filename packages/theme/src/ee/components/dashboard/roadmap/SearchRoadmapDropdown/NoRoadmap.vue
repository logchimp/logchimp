<template>
  <DropdownMenuItem
    :class="[
      'flex items-center gap-x-4 px-4 py-3',
      'cursor-pointer outline-none',
      'bg-white hover:bg-neutral-300/50 data-[highlighted]:bg-neutral-300/50',
    ]"
    @click="$emit('select', null)"
    textValue=""
  >
    <CircleDashed
      aria-hidden="true"
      class="size-4 stroke-neutral-700"
    />
    <div class="text-md">
      No roadmap
    </div>
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { CircleDashed } from "lucide-vue";
import { DropdownMenuItem } from "reka-ui";

defineOptions({
  name: "SearchBoardDropdownNoRoadmap",
});
</script>
