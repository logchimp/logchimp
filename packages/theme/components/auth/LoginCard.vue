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
      <Button type="primary" href="/login">
        Login
      </Button>
    </div>
  </div>
</template>

<script>
// components
import Button from "../ui/Button.vue";

export default {
  name: "LoginCard",
  components: {
    Button
  }
};
</script>
