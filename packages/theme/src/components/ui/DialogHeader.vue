<template>
  <header class="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-2xl">
    <DialogTitle class="text-xl font-semibold text-gray-900">
      <slot name="title">{{ title }}</slot>
    </DialogTitle>
    <DialogClose
      v-if="showCloseButton"
      aria-label="Close"
      class="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full p-2 transition-all duration-200"
    >
      <XIcon aria-hidden="true" class="w-4 h-4" />
    </DialogClose>
    <slot name="actions" />
  </header>
</template>

<script setup lang="ts">
import { DialogClose, DialogTitle } from 'reka-ui'
import { XIcon } from 'lucide-vue'

interface Props {
  title?: string
  showCloseButton?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  showCloseButton: true,
})
</script>
