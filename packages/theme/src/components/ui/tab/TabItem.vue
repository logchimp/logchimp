<template>
  <div class="tab-item" @click="$emit('click')">
    <div class="tab-item-icon">
      <slot name="icon" />
    </div>
    <h6 class="tab-item-content">
      <slot />
    </h6>
  </div>
</template>

<style lang='sass'>
.tab-item
	padding: 0.75rem 1.5rem
	display: flex
	align-items: center
	border-bottom: 3px solid var(--color-white)
	cursor: pointer

.tab-item-icon
	display: flex
	margin-right: 0.625rem

	svg
		stroke: var(--color-gray-70)
		width: 1.125rem
		height: 1.125rem

.tab-item-content
	color: var(--color-gray-70)
	margin-bottom: 0

.tab-item-active
	border-color: var(--color-brand-color)

	.tab-item-icon svg
		stroke: var(--color-brand-color)

	.tab-item-content
		color: var(--color-brand-color)
</style>
