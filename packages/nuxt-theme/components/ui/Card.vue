<template>
	<div :class="$style.card">
		<header v-if="hasHeaderSlot" :class="$style.header">
			<!-- title -->
			<h4 v-if="$slots.title" :class="$style.title">
				<slot name="title" />
			</h4>

			<!-- label -->
			<p v-if="$slots.label" :class="$style.label">
				<slot name="label" />
			</p>
		</header>

		<slot />
	</div>
</template>

<script>
export default {
	name: "Card",
	computed: {
		hasHeaderSlot() {
			return this.$slots.title || this.$slots.label
		}
	}
}
</script>

<style module>
.card {
	padding: 2rem;
	border: 1px solid var(--color-gray-90);
	border-radius: var(--border-radius-default);
}

.header {
	margin-bottom: 1.5rem;
}

.title, .label {
	text-align: center
}

.label {
	margin-top: 0.75rem;
	color: var(--color-gray-60);
	font-size: 0.875rem;
}
</style>
