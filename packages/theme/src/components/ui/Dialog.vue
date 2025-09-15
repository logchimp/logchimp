<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui"
import { X
 } from "lucide-vue"

const props = defineProps<{
  open?: boolean
}>()

const model = defineModel<boolean>("open", { default: false })
</script>

<template>
  <DialogRoot v-model:open="model">
    <DialogPortal>
      <DialogOverlay class="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
      <DialogContent
        class="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] h-[max-content] w-[90vw] max-w-[700px]
               translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none z-[100]"
      >
        <DialogTitle class="text-lg font-semibold mb-2">
          <slot name="title" />
        </DialogTitle>

        <DialogDescription class="text-sm text-gray-500 mb-4">
          <slot name="description" />
        </DialogDescription>

        <div class="mb-4">
          <slot />
        </div>
  <div class="mt-4 flex justify-end">
    <slot name="footer" />
  </div>
        <DialogClose
          class="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X
            size="16"
            class="pointer-events-none"/>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
