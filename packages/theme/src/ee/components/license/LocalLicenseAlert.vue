<script setup lang="ts">
import { Alert } from "../../../components/ui/Alert";
</script>

<template>
  <alert
    title="You can test this feature locally but not on production."
    type="warning"
  >
    <template #description>
      You can purchase <strong>LogChimp Self-Managed</strong> commercial license from our official <a href="https://logchimp.app?utm_medium=banner&utm_content=license_required">website</a>.
      If you already have a license key, <a href="https://docs.logchimp.app/self-hosting/license">follow the guide to add it to your LogChimp instance</a>, and if you need any
      further assistance, contact our support team at <a href="mailto:support@logchimp.app">support@logchimp.app</a>.
    </template>
  </alert>
</template>
