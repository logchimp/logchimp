<template>
  <div
    :class="[
      'flex items-center relative',
      'w-full overflow-hidden',
      'bg-neutral-200 rounded-md pr-1.5'
    ]"
  >
    <div
      :class="[
        'text-sm font-mono pl-3 pr-8 py-2.5 flex-1',
        'w-0 overflow-x-auto whitespace-nowrap'
      ]"
    >
      <span class="inline-block">
        {{value}}
      </span>
    </div>

    <button
      type="button"
      v-if="isSupported"
      @click="copy(value)"
      :class="[
        'flex items-center justify-center shrink-0',
        'absolute right-1 top-1/2 -translate-y-1/2',
        'cursor-pointer',
        'bg-neutral-300 rounded-sm p-1'
      ]"
      :aria-label="isCopied ? 'Copied' : 'Copy'"
    >
      <CheckIcon v-if="isCopied" class="size-4 stroke-emerald-700" />
      <CopyIcon v-else class="size-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { Copy as CopyIcon, Check as CheckIcon } from "lucide-vue";

const { copy, copied: isCopied, isSupported } = useClipboard();

interface Props {
  value: string;
}
defineProps<Props>();
</script>