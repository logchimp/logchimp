<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
      <DialogContent
        :class="[
          // center the dialog
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl',
          maxWidthClass,
          contentClass,
          'animate-in fade-in-0 zoom-in-95 duration-200'
        ]"
        @close-auto-focus="$emit('update:open', false)"
      >
        <header class="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-2xl">
          <DialogTitle class="text-xl font-semibold text-gray-900">
            <slot name="title">{{ title }}</slot>
          </DialogTitle>
          <DialogClose
            aria-label="Close"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full p-2 transition-all duration-200"
          >
            <span aria-hidden="true">×</span>
          </DialogClose>
        </header>

        <section class="p-6">
          <slot />
        </section>

        <footer class="flex justify-end space-x-3 p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-b-2xl">
          <slot name="footer">
            <DialogClose
              class="px-6 py-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
            >
              Close
            </DialogClose>
          </slot>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { computed } from 'vue'

// v-model:open support
const open = defineModel<boolean>('open', { default: false })

interface Props {
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'lg',
  contentClass: '',
})

defineEmits<{
  'update:open': [value: boolean]
}>()

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm':
      return 'max-w-md'
    case 'md':
      return 'max-w-lg'
    case 'lg':
      return 'max-w-2xl'
    case 'xl':
      return 'max-w-4xl'
    default:
      return 'max-w-2xl'
  }
})
</script>

<style scoped>
/* No extra styles; relies on Tailwind classes present in the project */
</style>
