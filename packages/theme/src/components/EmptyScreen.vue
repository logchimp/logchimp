<script setup lang="ts">
interface Props {
  title: string;
  icon?: unknown;
  description?: string;
  border?: boolean;
  dashedBorder?: boolean;
  learnMore?: string;
  paddingY?: string;
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
      'flex w-full select-none flex-col items-center justify-center rounded-lg px-7 lg:px-20',
      {
        'border border-(--color-gray-90)': border,
        'border-dashed': dashedBorder,
      },
      paddingY ? paddingY : 'py-7 lg:py-20'
    ]"
  >
    <div
      v-if="icon"
      class="size-16 flex items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-200"
    >
      <component
        :is="icon"
        class="size-8 stroke-neutral-800"
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
      <p
        class="font-medium text-base text-center text-neutral-950">
        {{title}}
      </p>

      <p
        v-if="description"
        class="mb-8 mt-3 text-center text-sm text-neutral-500"
      >
        {{description}}
        <template v-if="learnMore">
          <a
            :href="learnMore"
            target="_blank"
            class="underline underline-offset-2 hover:text-neutral-800"
          >
            Learn more ↗
          </a>
        </template>
      </p>

      <template v-if="$slots.button">
        <slot name="button" />
      </template>
    </div>
  </div>
</template>
