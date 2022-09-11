<template>
	<div :class="$style.error">
		<slot />
	</div>
</template>

<script>
export default {
	name: "ClientError"
}
</script>

<style module>
.error {
	text-align: center;
}
</style>

