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
