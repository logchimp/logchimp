<template>
  <card>
    <template #title>
			Setup your LogChimp site
    </template>
    <template #label>
			Complete your LogChimp site setup to access dashboard.
    </template>

    <div :class="$style.cta">
      <Button type="primary" href="/setup/welcome">
        Create owner account
      </Button>
    </div>

    <div :class="$style.image">
      <img
        src="https://cdn.logchimp.codecarrot.net/dashboard-loading-skeleton.png"
        alt="Dashboard loading skeleton"
      >
    </div>
  </card>
</template>

<script setup lang="ts">
import { router } from "../../router";

// components
import Card from "../ui/Card.vue";
import Button from "../ui/Button.vue";

function setupSite() {
	router.push("/setup/welcome");
}
</script>

<style module>
.cta {
	margin-bottom: 1.5rem;
}
.image {
	max-width: 20rem;
	margin-left: auto;
	margin-right: auto;
}
.image img {
	width: 100%;
}
</style>
