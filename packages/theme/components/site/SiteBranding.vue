<template>
	<nuxt-link :to="link" class="site-info">
		<div class="logo-placeholder">
			<img class="site-logo" :src="settings.logo" :alt="settings.title" />
		</div>
		<h5 v-if="settings.title" class="site-name">
			{{ settings.title }}
		</h5>
	</nuxt-link>
</template>

<script>
export default {
	name: "SiteBranding",
	props: {
		settings: {
			type: Object,
			required: true
		},
		dashboard: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		link() {
			return this.dashboard ? "/dashboard" : "/";
		}
	}
};
</script>
