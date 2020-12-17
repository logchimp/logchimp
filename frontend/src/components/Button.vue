<template>
	<div
		class="button"
		:class="[
			`button-${type}`,
			loading ? 'button-loading' : '',
			disabled ? 'button-primary-disabled' : ''
		]"
		@click="click"
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
		},
		disabled: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		click() {
			if (this.loading) return;
			if (this.disabled) return;
			this.$emit("click");
		}
	},
	components: {
		LoaderIcon
	}
};
</script>
