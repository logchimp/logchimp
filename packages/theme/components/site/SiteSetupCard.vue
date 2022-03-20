<template>
  <div class="card">
    <div class="card-section card-header">
      <h4 class="card-header-title">
        Setup your LogChimp site
      </h4>
      <p class="card-header-label">
        Complete your LogChimp site setup to access dashboard.
      </p>
    </div>
    <div class="card-section">
      <Button type="primary" href="/setup/welcome">
        Create owner account
      </Button>
    </div>
    <div class="card-section">
      <img
        style="width: 20rem"
        src="https://cdn.logchimp.codecarrot.net/dashboard-loading-skeleton.png"
        alt="Dashboard loading skeleton"
      >
    </div>
  </div>
</template>

<script>
// components
import Button from "../ui/Button.vue";

export default {
  name: "SiteSetupCard",
  components: {
    Button
  }
};
</script>
