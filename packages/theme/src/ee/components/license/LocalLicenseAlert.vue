<script setup lang="ts">
import { DEFAULT_LOGCHIMP_PILOT_URL } from "../../../constants";
import { Alert } from "../../../components/ui/Alert";
</script>

<template>
  <alert
    title="You can test this feature locally but not on production."
    type="warning"
  >
    <template #description>
      To purchase a commercial license, please reach out to our sales team. If a license key is already in place, please contact sales@logchimp.app for help.
      <a class="underline" :href="DEFAULT_LOGCHIMP_PILOT_URL">
        Contact Sales
      </a>
    </template>
  </alert>
</template>
