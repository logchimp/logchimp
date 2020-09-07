<template>
	<div class="onboarding__content">
		<h2 class="onboarding__heading">Create a new board</h2>
		<p class="onboarding__label">
			A board is a place where people can post and vote on ideas for a specific
			topic.
		</p>
		<create-board />
	</div>
</template>

<script>
// components
import CreateBoard from "../../components/board/CreateBoard";

export default {
	name: "OnboardingWelcome",
	components: {
		CreateBoard
	}
};
</script>
