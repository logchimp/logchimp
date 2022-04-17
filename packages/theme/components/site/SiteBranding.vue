<template>
	<a :href="link" :class="$style.branding">
		<div :class="$style.placeholder">
			<img :class="$style.image" :src="settings.logo" :alt="settings.title" />
		</div>
		<h5
			v-if="settings.title"
			:class="$style.name"
		>
			{{ settings.title }}
		</h5>
	</a>
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

<style lang='sass' module>
.branding
	--logo-size: 2rem
	display: flex
	align-items: center
	user-select: none

.placeholder
	width: var(--logo-size)
	height: var(--logo-size)
	background-color: var(--color-gray-97)
	border-radius: 3rem
	cursor: pointer
	user-select: none

.image
	width: var(--logo-size)

.name
	margin-left: 0.625rem
	margin-bottom: 0
	color: var(--color-white)
</style>
