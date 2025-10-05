<template>
  <div
    :class="[
      'border border-(--border-color-default)',
      'rounded-lg w-full overflow-hidden',
      'bg-white drop-shadow-xs'
    ]"
  >
    <div
      :class="[
        'text-(--color-gray-70) text-left uppercase text-xs font-semibold',
        'flex items-center',
        'border-b-2 border-b-(--border-color-default)',
        'select-none pointer-events-none',
        'px-2'
      ]"
    >
      <slot name="header" />
    </div>

    <div class="divide-y-1 divide-neutral-200">
      <slot />
    </div>

    <slot
      v-if="$slots['infinite-loader']"
      name="infinite-loader"
    />
  </div>
</template>
