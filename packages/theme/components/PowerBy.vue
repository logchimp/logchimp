<template>
	<div class="logchimp-poweredby">
		<a
			:href="`https://logchimp.codecarrot.net/?utm_source=${source}&utm_medium=powered&company=${settings.title}`"
		>
			Powered by LogChimp
		</a>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
	name: "PowerBy",
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
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
