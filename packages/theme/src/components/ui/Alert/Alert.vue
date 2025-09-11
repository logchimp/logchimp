<template>
  <div
    :style="{
      animationDuration: timeout / 1000 + 's'
    }"
    :class="{
      [$style.alert]: true,
      [$style.toast]: isToast,
      'p-4 rounded-(--border-radius-default)': true,
      'bg-green-300/30': type === 'success',
      'bg-(--color-yellow-50)': type === 'warning',
      'bg-(--color-red-50)': type === 'error',
    }"
  >
    <div class="grid gap-x-3 items-center grid-cols-[1.5rem_1fr]">
      <div
        :class="[
          $style.icon,
          'flex size-6 [&>svg]:size-6',
          type === 'success' && '[&>svg]:stroke-emerald-600',
          type === 'warning' && '[&>svg]:stroke-(--color-yellow-400)',
          type === 'error' && '[&>svg]:stroke-(--color-red-800)'
        ]"
      >
        <slot name="icon">
          <success-icon v-if="type === 'success'" aria-hidden="true" />
          <warning-icon  v-if="type === 'warning'" aria-hidden="true" />
          <error-icon v-if="type === 'error'" aria-hidden="true" />
        </slot>
      </div>

      <div
        :class="[
          'font-medium',
          type === 'warning' && 'text-(--color-yellow-800)',
          type === 'error' && 'text-(--color-red-800)',
        ]"
      >
        {{ title }}
      </div>
    </div>

    <div v-if="hasFooter" :class="$style.footer">
      <div
        :class="[
          'mt-2 ml-9 text-sm',
          type === 'warning' && 'text-(--color-yellow-700)',
          type === 'error' && 'text-(--color-red-700)',
        ]"
        v-if="hasDescription"
      >
        <template v-if="$slots.description">
          <slot name="description" />
        </template>
        <template v-else>
          {{ description }}
        </template>
      </div>

      <div class="mt-4" v-if="$slots.cta">
        <slot name="cta" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, useSlots } from "vue";
import {
  CheckCircle2 as SuccessIcon,
  AlertTriangle as WarningIcon,
  XCircle as ErrorIcon,
} from "lucide-vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    required: true,
  },
  timeout: {
    type: Number,
    default: 2000,
  },
  isToast: {
    type: Boolean,
    default: false,
  },
});

const hasDescription = computed(
  () => props.description || useSlots().description,
);
const hasFooter = computed(() => hasDescription || useSlots().cta);
const emit = defineEmits(["remove"]);

onMounted(() => {
  setTimeout(() => emit("remove"), props.timeout);
});
</script>

<style lang='scss' module>
.alert.toast {
  box-shadow: 2px 4px 20px 2px rgba(0, 0, 0, 0.12);
  animation-name: alertfade;
	animation-timing-function: linear;
  max-width: 250px;

  @keyframes alertfade {
    0% {
      opacity: 1;
    }
    60% {
      opacity: 1;
    }
    80%{
      opacity: 0.5;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
