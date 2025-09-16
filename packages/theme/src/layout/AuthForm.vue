<template>
	<div class="max-w-sm px-4 mt-8 mx-auto">
		<slot />
	</div>
</template>

<script setup lang="ts">
defineOptions({
  name: "AuthFormLayout",
});
</script>

<style lang='sass'>
.auth-form-header
	margin-bottom: 2rem
	display: flex
	flex-direction: column
	align-items: center

.auth-form-heading
	font-weight: 400
	text-align: center
	margin-top: 1rem
	margin-bottom: 0

.auth-form-other
	font-size: 0.8rem
	text-align: center
	color: var(--color-gray-60)
	margin-top: 1.5rem
</style>
