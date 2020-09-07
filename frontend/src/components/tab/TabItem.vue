<template>
	<div class="tab__item" @click="$emit('click')">
		<div class="tab__item-icon">
			<slot name="icon" />
		</div>
		<div class="tab__item-content">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	name: "TabItem"
};
</script>
