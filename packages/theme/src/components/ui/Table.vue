<template>
  <table class="border border-(--color-gray-90) rounded-lg w-full">
    <thead class="table-header">
      <slot name="header" />
    </thead>
    <tbody class="table-body">
      <slot />
    </tbody>
  </table>
</template>

<style lang='sass'>
.table-heading
	color: var(--color-gray-40)
	font-size: 0.875rem
	font-weight: 500
	margin-left: 0.375rem
	margin-bottom: 0.5rem

.table-header
	color: var(--color-gray-70)
	text-transform: uppercase
	font-size: 0.75rem
	font-weight: 600
	display: flex
	align-items: center

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
