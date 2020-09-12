<template>
	<div class="dropdown-item" @click="$emit('click')">
		<div class="dropdown-item-icon">
			<slot name="icon" />
		</div>
		<div class="dropdown-item-content">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	name: "DropdownItem"
};
</script>
