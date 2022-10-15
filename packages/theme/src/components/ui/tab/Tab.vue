<template>
  <div class="tab">
    <slot />
  </div>
</template>

<style lang='sass'>
.tab
	display: flex
	align-items: center
	border-bottom: 1px solid var(--color-gray-90)
	margin-bottom: 1.25rem
</style>
