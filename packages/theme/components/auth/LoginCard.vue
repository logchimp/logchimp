<template>
  <card>
		<template #title>
			Login
		</template>
		<template #label>
			Log in to your account to give feedback
		</template>

		<Button type="primary" href="/login">
			Login
		</Button>
  </card>
</template>

<script>
// components
import Card from "../ui/Card.vue";
import Button from "../ui/Button.vue";

export default {
  name: "LoginCard",
  components: {
		// components
		Card,
    Button
  }
};
</script>
