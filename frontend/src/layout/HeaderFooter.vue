<template>
	<div>
		<Header />
		<div class="container">
			<router-view />
			<power-by v-if="getSiteSittings.isPoweredBy" />
		</div>
	</div>
</template>

<script>
// components
import Header from "../components/Header";
import PowerBy from "../components/PowerBy";

export default {
	name: "HeaderFooter",
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	components: {
		Header,
		PowerBy
	}
};
</script>
