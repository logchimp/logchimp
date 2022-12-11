<template>
  <card>
		<template #title>
			Login
		</template>
		<template #label>
			Log in to your account to give feedback
		</template>

		<Button type="primary" @click="loginRedirect" :full-width="true">
			Login
		</Button>
  </card>
</template>

<script setup lang="ts">
import { router } from "../../router";

// components
import Card from "../ui/Card.vue";
import Button from "../ui/Button.vue";

function loginRedirect() {
	const route = router.currentRoute.value;

	router.push({
		path: "/login",
		query: {
			redirect: route.fullPath
		}
	});
}
</script>
