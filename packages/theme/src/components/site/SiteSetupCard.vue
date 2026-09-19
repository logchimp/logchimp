<template>
  <card>
    <template #title>
      {{ t("onboarding.setup_logchimp_site_title") }}
    </template>
    <template #label>
      {{ t("onboarding.setup_logchimp_site_description") }}
    </template>

    <div :class="$style.cta">
      <Button type="primary" href="/setup/welcome">
        {{ t("onboarding.create_owner_account") }}
      </Button>
    </div>

    <div :class="$style.image">
      <img
        src="/dashboard-loading-skeleton.png"
        alt="Dashboard loading skeleton"
      />
    </div>
  </card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// components
import Card from "../ui/Card.vue";
import Button from "../ui/Button.vue";

const { t } = useI18n();
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
