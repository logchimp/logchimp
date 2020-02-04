<template>
	<div
		class="button button__primary"
		:class="{
			'button__primary-disabled': disabled
		}"
	>
		<slot />
	</div>
</template>

<script>
export default {
	name: "LPrimaryButton",
	props: {
		disabled: {
			type: Boolean,
			default: false
		}
	}
};
</script>
