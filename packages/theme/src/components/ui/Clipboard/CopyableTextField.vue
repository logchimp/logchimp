<template>
  <div
    :class="[
      'flex items-center relative',
      'w-full overflow-hidden',
      {
        'bg-neutral-200 rounded-md': !minimal,
        'pr-1.5': !minimal,
        'gap-x-px': minimal,
      },
    ]"
  >
    <div
      :class="[
        'text-sm',
        !minimal && [
          'font-mono pl-3 pr-8 py-2 flex-1',
          'w-0 overflow-x-auto whitespace-nowrap',
        ],
      ]"
    >
      <span class="inline-block">
        {{ value }}
      </span>
    </div>

    <button
      v-if="isSupported"
      type="button"
      :class="[
        'flex items-center justify-center shrink-0',
        'cursor-pointer rounded-sm p-1',
        minimal ? 'hover:bg-neutral-300' : 'bg-neutral-300',
        {
          'absolute right-1 top-1/2 -translate-y-1/2': !minimal,
        },
      ]"
      :aria-label="isCopied ? t('actions.copied') : t('actions.copy')"
      @click="copy(value)"
    >
      <CheckIcon
        v-if="isCopied"
        :class="['stroke-emerald-700', iconSizeClass]"
      />
      <CopyIcon v-else :class="['stroke-neutral-700', iconSizeClass]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { Copy as CopyIcon, Check as CheckIcon } from "lucide-vue";
import { useI18n } from "vue-i18n";

const { copy, copied: isCopied, isSupported } = useClipboard();
const { t } = useI18n();

interface Props {
  value: string;
  minimal?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  minimal: false,
});

const iconSizeClass = computed(() => (props.minimal ? "size-4" : "size-5"));
</script>
