<template>
  <footer class="flex justify-end space-x-3 p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-b-2xl">
    <slot>
      <DialogClose
        v-if="showDefaultClose"
        class="px-6 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
      >
        {{ closeButtonText }}
      </DialogClose>
    </slot>
  </footer>
</template>

<script setup lang="ts">
import { DialogClose } from 'reka-ui'

interface Props {
  showDefaultClose?: boolean
  closeButtonText?: string
}

withDefaults(defineProps<Props>(), {
  showDefaultClose: true,
  closeButtonText: 'Close',
})
</script>
