<script setup lang="ts">
import { ServerCrashIcon } from "lucide-vue";

defineOptions({
  name: "Dashboard500",
});
</script>

<template>
  <div class="h-[inherit] flex flex-col items-center justify-center flex-grow-1 gap-y-5">
    <ServerCrashIcon aria-hidden="true" class="stroke-neutral-700 stroke-[1px] size-16" />
    <div class="flex flex-col items-center justify-center gap-y-2">
      <div  class="font-medium">
        <slot>
          Something went wrong.
        </slot>
      </div>
      <p class="text-xs text-neutral-800">
        An unexpected error occurred on our end. Not your fault. Refresh or try again soon.
      </p>
    </div>
  </div>
</template>
