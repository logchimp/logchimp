<template>
  <card>
		<template #title>
			Login
		</template>
		<template #label>
			Log in to your account to give feedback
		</template>

		<Button type="primary" :href="loginRedirect" :full-width="true">
			Login
		</Button>
  </card>
</template>

<script setup lang="ts">
import { computed } from "vue";

import Card from "../ui/Card.vue";
import Button from "../ui/Button.vue";
import { useLoginRedirectUrl } from "../../hooks/useLoginRedirectUrl";

const loginRedirect = computed(() => useLoginRedirectUrl());
</script>
