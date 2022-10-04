<template>
  <div class="logchimp-poweredby">
    <a
      :href="
        `https://logchimp.codecarrot.net/?utm_source=${source}&utm_medium=powered&company=${siteSettings.title}`
      "
    >
      Powered by LogChimp
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router"

import { useSettingStore } from "../store/settings"

const route = useRoute();
const { get: siteSettings } = useSettingStore()

const source = computed(() => route.name?.toString())
</script>
