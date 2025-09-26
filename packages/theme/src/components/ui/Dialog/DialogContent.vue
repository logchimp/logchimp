<template>
  <DialogContent
    :class="[
      'fixed top-1/2 left-1/2 rounded-lg bg-white p-6 shadow-lg',
      'w-full max-h-[calc(100vh-10%)] overflow-y-auto',
      '-translate-x-1/2 -translate-y-1/2',
      'focus:outline-none z-60',
      {
        'max-w-sm': size === 'sm',
        'max-w-lg': size === 'md',
        'max-w-2xl': size === 'lg',
      }
    ]"
  >
    <header class="flex items-center justify-between mb-2">
      <DialogTitle class="text-lg font-semibold" as="div">
        <slot name="title" />
      </DialogTitle>

      <DialogCloseIconButton />
    </header>

    <DialogDescription class="text-sm text-neutral-500 mb-4">
      <slot name="description" />
    </DialogDescription>

    <div>
      <slot />
    </div>

    <footer v-if="$slots.footer" class="flex justify-end mt-4">
      <slot name="footer" />
    </footer>
  </DialogContent>
</template>

<script setup lang="ts">
import { DialogContent, DialogDescription, DialogTitle } from "reka-ui";

import type { DialogContentProps } from "./types";
import DialogCloseIconButton from "./DialogCloseIconButton.vue";

withDefaults(defineProps<DialogContentProps>(), {
  size: "md",
});
</script>
