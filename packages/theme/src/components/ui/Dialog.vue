<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogBackdrop />
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
        <DialogHeader :title="title">
          <template #title>
            <slot name="title">{{ title }}</slot>
          </template>
          <template #actions>
            <slot name="header-actions" />
          </template>
        </DialogHeader>

        <section class="p-6">
          <slot />
        </section>

        <DialogFooter>
          <slot name="footer" />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogContent,
  DialogPortal,
  DialogRoot,
} from 'reka-ui'
import { computed } from 'vue'
import DialogBackdrop from './DialogBackdrop.vue'
import DialogHeader from './DialogHeader.vue'
import DialogFooter from './DialogFooter.vue'

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
