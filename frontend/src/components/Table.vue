<template>
	<div class="table-container">
		<div class="table-header">
			<slot name="header" />
		</div>
		<div class="table-content">
			<slot />
		</div>
	</div>
</template>

<script>
export default {
	name: "Table"
};
</script>

<style lang="sass">
.table-container
	border: 1px solid $gray-90
	border-radius: $border-radius

.table-header
	color: $gray-70
	text-transform: uppercase
	font-size: .75rem
	font-weight: 600
	display: flex
	align-items: center
	padding: 1.125rem 1.5rem .75rem

.table-body-loader
	display: flex
	justify-content: center

.table-body-loader, .table-content-item
	padding: 1rem 1.5rem

.table-content-item
	color: $text-black
	display: flex
	align-items: center

	&:hover
		background-color: $gray-97

		&:last-child
			border-bottom-left-radius: $border-radius
			border-bottom-right-radius: $border-radius
</style>
