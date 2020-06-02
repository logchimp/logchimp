<template>
	<div class="dropdown__item">
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
