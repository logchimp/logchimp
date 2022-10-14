<template>
  <div class="card">
    <div class="card-section card-header">
      <h4 class="card-header-title">
        Login
      </h4>
      <p class="card-header-label">
        Log in to your account to give feedback
      </p>
    </div>
    <div class="card-section">
      <Button type="primary" @click="loginRedirect">
        Login
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { router } from "../../router";

// components
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
