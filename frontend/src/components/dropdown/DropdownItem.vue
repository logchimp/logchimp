<template>
	<div class="dropdown__item" @click="$emit('click')">
		<div class="dropdown__item-icon">
			<slot name="icon" />
		</div>
		<div class="dropdown__item-content">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	name: "DropdropItem"
};
</script>
