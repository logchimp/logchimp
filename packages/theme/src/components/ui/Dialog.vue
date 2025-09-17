<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { X as CloseIcon } from "lucide-vue";

const model = defineModel<boolean>("open", { default: false });
</script>

<template>
  <DialogRoot v-model:open="model">
    <DialogPortal>
      <DialogOverlay class="bg-black/20 backdrop-blur-sm data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px]
               translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none z-[100]"
      >
      <div class="flex items-center justify-between mb-2">
        <DialogTitle class="text-lg font-semibold mb-2">
          <slot name="title" />
        </DialogTitle>
  <DialogClose
          class=" text-gray-500 hover:text-black "
          aria-label="Close"
        >
        <!-- -->
        <CloseIcon aria-hidden="true" />
        </DialogClose>
        </div>
        <DialogDescription class="text-sm text-gray-500 mb-4">
          <slot name="description" />
        </DialogDescription>

        <div class="mb-4">
          <slot />
        </div>
<footer class="flex justify-end">
  <slot name="footer" />
</footer>
        <!-- Default close button -->
      
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>