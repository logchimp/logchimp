<template>
  <div
    :style="{
      animationDuration: timeout / 1000 + 's'
    }"
    :class="{
      [$style.alert]: true,
      [$style.toast]: isToast,
      [$style[type]]: type,
    }"
  >
    <div :class="$style.header">
      <div :class="$style.icon">
        <success-icon
          v-if="type === 'success'"
          class="alert-icon alert-icon-success"
        />
        <warning-icon
          v-if="type === 'warning'"
          class="alert-icon alert-icon-warning"
        />
        <error-icon v-if="type === 'error'" class="alert-icon alert-icon-error" />
      </div>

      <h6 :class="$style.title">
        {{ title }}
      </h6>
    </div>

    <div v-if="hasFooter" :class="$style.footer">
      <div :class="$style.description" v-if="hasDescription">
        <template v-if="$slots.description">
          <slot name="description" />
        </template>
        <template v-else>
          {{ description }}
        </template>
      </div>

      <div :class="$style.cta" v-if="$slots.cta">
        <slot name="cta" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, useSlots } from 'vue';
import {
  CheckCircle2 as SuccessIcon,
  AlertTriangle as WarningIcon,
  XCircle as ErrorIcon,
} from "lucide-vue"

const props = defineProps({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
    default: "",
	},
	type: {
		type: String,
		required: true
	},
	timeout: {
		type: Number,
		default: 2000
	},
  isToast: {
    type: Boolean,
    default: false,
  }
})

const hasDescription = computed(() => props.description || useSlots().description)
const hasFooter = computed(() => hasDescription || useSlots().cta)
const emit = defineEmits(['remove'])

onMounted(() => {
	setTimeout(() => emit("remove"), props.timeout);
})
</script>

<style lang='scss' module>
.alert {
  padding: 1rem;
  border-radius: var(--border-radius-default);

  .header {
    display: grid;
    grid-template-columns: 1.5rem 1fr;
    grid-gap: 0.75rem;
    align-items: center;
  }

  .icon {
    display: flex;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }

  .title {
    font-weight: 500;
    margin-bottom: 0;
  }

  .footer {
    margin-top: 0.5rem;
    margin-left: calc(1.5rem + 0.75rem);
  }

  .cta {
    margin-top: 1rem;
  }
}

.alert.success {
	background-color: var(--color-color-success);
}

.alert.warning {
  background-color: var(--color-yellow-50);

  .icon svg {
    stroke: var(--color-yellow-400);
  }

  .title {
    color: var(--color-yellow-800);
  }

  .description {
    color: var(--color-yellow-700);
  }
}

.alert.error {
  background-color: var(--color-red-50);

  .icon svg {
    stroke: var(--color-red-400);
  }

  .title {
    color: var(--color-red-800);
  }

  .description {
    color: var(--color-red-700);
  }
}

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
