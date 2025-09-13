<template>
	<div class="flex justify-center">
    <div class="hover:bg-neutral-200/70 rounded-lg">
      <a
        :href="
				`https://logchimp.codecarrot.net/?utm_source=${source}&utm_medium=powered&company=${siteSettings.title}`
			"
        :class="['text-xs font-medium text-(--color-gray-70)',
        'px-2 py-0.5'
        ]"
      >
        {{t("powerBy.poweredByLogchimp")}}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import { useSettingStore } from "../store/settings";

const route = useRoute();
const { get: siteSettings } = useSettingStore();

const source = computed(() => route.name?.toString());

const { t } = useI18n();
</script>
