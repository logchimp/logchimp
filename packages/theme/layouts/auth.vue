<template>
	<div class="auth-form">
		<Nuxt />
	</div>
</template>

<script>
export default {
	name: "AuthLayout"
};
</script>

<style lang='sass'>
.auth-form
	width: 24rem
	padding: 0 1rem
	margin-top: 2rem
	margin-left: auto
	margin-right: auto

.auth-form-header
	margin-bottom: 2rem
	display: flex
	flex-direction: column
	align-items: center

	.site-name
		color: var(--color-text-black)

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
