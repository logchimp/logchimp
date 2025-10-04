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
        'select-none pointer-events-none'
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

<style lang='sass'>
.table-heading
	color: var(--color-gray-40)
	font-size: 0.875rem
	font-weight: 500
	margin-left: 0.375rem
	margin-bottom: 0.5rem

.table-header-item
	padding: 1.125rem 1.5rem 0.75rem

.table-body-loader
	display: flex
	justify-content: center
	padding: 1rem 1.5rem

.table-row
	color: var(--color-text-black)
	display: flex
	align-items: center

	&:hover
		background-color: var(--color-gray-97)

		&:last-child
			border-bottom-left-radius: var(--border-radius-default)
			border-bottom-right-radius: var(--border-radius-default)

.table-data
	padding: 1rem 1.5rem

.table-icon-group
	display: flex
	align-items: center

.table-data-icon
	display: flex
	cursor: pointer

	&:hover svg
		stroke: var(--color-gray-60)

	svg
		width: 1.125rem
		height: 1.125rem
		stroke: var(--color-gray-80)
</style>
<script setup lang="ts">
</script>