<template>
	<div class="logchimp-poweredby">
		<a
			:href="`https://logchimp.codecarrot.net/?utm_source=${source}&utm_medium=powered&company=${getSiteSittings.title}`"
		>
			Powered by LogChimp
		</a>
	</div>
</template>

<script>
export default {
	name: "PowerBy",
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		},
		source() {
			return this.$route.name;
		}
	}
};
</script>

<style lang='sass'>
.logchimp-poweredby
	display: flex
	justify-content: center
	margin-top: 2rem

	a
		font-size: 0.875rem
		color: var(--color-gray-70)
</style>
