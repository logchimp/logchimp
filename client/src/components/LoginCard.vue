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

<script>
// components
import Button from "./Button";

export default {
  name: "LoginCard",
  components: {
    Button
  },
  methods: {
    loginRedirect() {
      this.$router.push({
        path: "/login",
        query: {
          redirect: this.$route.fullPath
        }
      });
    }
  }
};
</script>
