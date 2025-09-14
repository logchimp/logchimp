<template>
  <card>
    <template #title>
		 {{ t("setupCard.title") }}
    </template>
    <template #label>
		    {{ t("setupCard.label") }} 
    </template>

    <div :class="$style.cta">
      <Button type="primary" href="/setup/welcome">
        {{ t("setupCard.cta") }}
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
