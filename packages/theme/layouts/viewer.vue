<template>
	<div
		:style="{
			'--color-brand-color': `#${settings.accentColor}`
		}"
	>
		<Header />
		<div class="container container-view">
			<nuxt />
			<power-by v-if="settings.isPoweredBy" />
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";

// components
import Header from "../components/Header.vue";
import PowerBy from "../components/PowerBy.vue";

export default {
	name: "ViewerLayout",
	components: {
		// components
		Header,
		PowerBy
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	async mounted() {
		if (!process.server) {
			const user = localStorage.getItem("user");

			if (user) {
				this.$store.dispatch("user/login", JSON.parse(user));

				const token = this.$store.getters["user/getAuthToken"];
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/users/permissions",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.$store.commit("user/setPermissions", response.data);
			}
		}
	},
	head() {
		return {
			htmlAttrs: {
				lang: "en",
				hreflang: "en"
			},
			meta: [
				{
					name: "generator",
					content: `LogChimp v${process.env.version}`
				},
				{
					name: "theme-color",
					content: this.settings.accentColor
				},
				{
					name: "msapplication-TileColor",
					content: this.settings.accentColor
				}
			]
		};
	}
};
</script>
