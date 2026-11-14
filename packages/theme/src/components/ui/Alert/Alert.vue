<template>
  <div
    :style="{
      animationDuration: timeout / 1000 + 's',
    }"
    class="p-4 border rounded-lg"
    :class="{
      [$style.alert]: true,
      [$style.toast]: isToast,
      'drop-shadow-xs': isToast,
      'bg-(--color-emerald-50) border-(--color-emerald-300)':
        type === 'success',
      'bg-(--color-yellow-50) border-(--color-yellow-300)': type === 'warning',
      'bg-(--color-red-100) border-(--color-red-300)': type === 'error',
    }"
  >
    <div class="grid gap-x-3 items-start grid-cols-[1.25rem_1fr]">
      <div
        :class="[
          'flex',
          isToast ? 'size-5 [&>svg]:size-5' : 'size-6 [&>svg]:size-6',
          type === 'success' && '[&>svg]:fill-(--color-emerald-600)',
          type === 'warning' && '[&>svg]:fill-(--color-yellow-600)',
          type === 'error' && '[&>svg]:fill-(--color-red-600)',
        ]"
      >
        <slot name="icon">
          <success-icon v-if="type === 'success'" aria-hidden="true" />
          <warning-icon v-if="type === 'warning'" aria-hidden="true" />
          <error-icon v-if="type === 'error'" aria-hidden="true" />
        </slot>
      </div>

      <div :class="['font-medium', isToast ? 'text-sm' : '']">
        {{ title }}
      </div>
    </div>

    <div v-if="hasFooter">
      <div
        v-if="hasDescription"
        :class="['mt-2 ml-8 text-sm text-neutral-600']"
      >
        <template v-if="$slots.description">
          <slot name="description" />
        </template>
        <template v-else>
          {{ description }}
        </template>
      </div>

      <div v-if="$slots.cta" class="mt-4">
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
const hasFooter = computed(() => hasDescription.value || useSlots().cta);
const emit = defineEmits(["remove"]);

onMounted(() => {
  setTimeout(() => emit("remove"), props.timeout);
});
</script>

<style lang="scss" module>
.alert.toast {
  animation-name: alertfade;
  animation-timing-function: linear;
  max-width: 300px;

  @keyframes alertfade {
    0% {
      opacity: 1;
    }
    60% {
      opacity: 1;
    }
    80% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
