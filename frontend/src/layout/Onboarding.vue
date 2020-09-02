<template>
	<container>
		<div class="onboarding">
			<router-view />
		</div>
	</container>
</template>

<script>
// components
import Container from "../components/Container";

export default {
	name: "Onboarding",
	components: {
		Container
	}
};
</script>

<style lang="sass" scoped>
.onboarding
	max-width: 600px
	width: 100%
	margin-top: 4rem
	margin-bottom: 4rem
	margin-left: auto
	margin-right: auto

</style>

<style lang="sass">
.onboarding__content
	display: flex
	flex-direction: column
	align-items: center

.onboarding__heading
	color: $text-black
	font-weight: 400
	text-align: center

	span
		font-weight: 600

.onboarding__label
	color: $gray-60
	text-align: center
	line-height: 20px
	margin-bottom: 2rem
</style>
