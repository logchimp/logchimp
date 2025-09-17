<script setup lang="ts">
import { FileSearchIcon } from "lucide-vue";

defineOptions({
  name: "Dashboard404",
});
</script>

<template>
  <div class="h-[inherit] flex flex-col items-center justify-center flex-grow-1 gap-y-5">
    <FileSearchIcon aria-hidden="true" class="stroke-neutral-700 stroke-[1px] size-16" />
    <div class="flex flex-col items-center justify-center gap-y-2">
      <div  class="font-medium">
        <slot>
          Not found
        </slot>
      </div>
      <p class="text-xs text-neutral-800">
        We could not find the page you were looking for.
      </p>
    </div>
  </div>
</template>
