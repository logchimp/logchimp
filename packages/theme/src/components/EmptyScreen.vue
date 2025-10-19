<script setup lang="ts">
interface Props {
  title: string;
  icon?: unknown;
  description?: string;
  border?: boolean;
  dashedBorder?: boolean;
}

withDefaults(defineProps<Props>(), {
  border: true,
  dashedBorder: true,
});
</script>

<template>
  <div
    data-testid="empty-screen"
    :class="[
      'flex w-full select-none flex-col items-center justify-center rounded-lg p-7 lg:p-20',
      {
        'border border-(--color-gray-90)': border,
        'border-dashed': dashedBorder,
      }
    ]"
  >
    <div
      v-if="icon"
      class=""
    >
      <component
        :is="icon"
        class="size-12"
        aria-hidden="true"
      />
    </div>

    <div
      :class="[
        'max-w-md',
        {
          'mt-6': icon,
        }
      ]"
    >
      <h2
        class="text-semibold text-2xl text-center">
        {{title}}
      </h2>

      <p
        v-if="description"
        class="mb-8 mt-3 text-center text-sm text-neutral-500"
      >
        {{description}}
      </p>

      <template v-if="$slots.button">
        <slot name="button" />
      </template>
    </div>
  </div>
</template>
