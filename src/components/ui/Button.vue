<template>
	<div class="button" :class="[`button__${type}`]">
		<slot />
	</div>
</template>

<script>
export default {
	name: "Button",
	props: {
		type: {
			type: String,
			required: true
		}
	}
};
</script>
