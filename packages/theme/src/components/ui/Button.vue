<template>
	<component
		:is="href ? 'a' : as"
		:class="[
      'group flex items-center justify-center gap-2 relative leading-5',
      'overflow-hidden select-none rounded-(--border-radius-default)',
      'text-md font-medium',
      // TODO: improve a11y styles
      'outline-none',
      // primary
      type === 'primary' && [
        'bg-(--color-brand-color) text-white',
      ],
      {
        [`button-${type}`]: !!type,
        'border border-white/50 hover:border-white': outline,
        'w-full': fullWidth,
        // size
        'px-3 py-1.5 h-8': size === 'small',
        'px-5 py-2.5 h-[2.625rem]': size === 'medium',
        'cursor-pointer': !loading && !disabled,
        // loading
        'opacity-70': loading,
        // disabled
        'opacity-70 cursor-not-allowed': disabled,
      }
		]"
		:href="href ? href : undefined"
		@click="click"
    :disabled="(as === 'button' && disabled) ? 'true' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-busy="loading ? true : undefined"
	>
		<div
      v-if="loading"
      aria-hidden="true"
    >
      <loader-icon
        :class="[
          'spinner',
          type === 'primary' && 'stroke-white'
        ]"
      />
		</div>
		<span>
      <slot />
    </span>
	</component>
</template>

<script setup lang="ts">
import LoaderIcon from "../icons/Loader.vue";

type ButtonSize = "small" | "medium";
const props = defineProps({
  as: {
    default: "button",
    validator: (value: "a" | "button") => ["a", "button"].includes(value),
  },
  href: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "medium",
    validator: (value: ButtonSize) => ["small", "medium"].includes(value),
  },
  outline: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

function click() {
  if (props.loading) return;
  if (props.disabled) return;
  emit("click");
}
</script>
