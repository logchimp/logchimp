<template>
	<div
		class="button"
		:class="[`button-${type}`, loading ? 'button-loading' : '']"
		@click="$emit('click')"
	>
		<slot />
		<div class="button-loader" v-if="loading">
			<loader-icon />
		</div>
	</div>
</template>

<script>
// icons
import LoaderIcon from "./icons/Loader";

export default {
	name: "Button",
	props: {
		type: {
			type: String,
			required: true
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	components: {
		LoaderIcon
	}
};
</script>
