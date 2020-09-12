<template>
	<div class="onboarding-content">
		<h2 class="onboarding-heading">Create a new board</h2>
		<p class="onboarding-label">
			A board is a place where people can post and vote on ideas for a specific
			topic.
		</p>
		<create-board redirect="/dashboard" />
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
