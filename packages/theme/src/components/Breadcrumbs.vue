<template>
  <div class="flex items-center">
    <slot />
  </div>
</template>

<style lang='sass'>
.breadcrum-item, .breadcrum-divider
	font-weight: 500

.breadcrum-item
	margin-bottom: 0
	font-size: 1.5rem
	color: var(--color-text-black)

.breadcrum-divider
	padding: 0 0.5rem
	font-weight: 500
</style>
