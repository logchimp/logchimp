<script setup lang="ts">
import { KeyIcon } from "lucide-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  resourceType: "posts" | "boards" | "roadmaps" | "roles";
}>();
</script>

<template>
  <div
    class="border border-dashed border-red-300/80 rounded-lg p-4 text-center flex flex-col items-center gap-y-2.5"
  >
    <KeyIcon class="stroke-red-600" />
    <p class="mb-1 font-medium">
      {{ t("license.license_issue_title") }}
    </p>
    <span class="text-neutral-600 text-sm">
      {{ t("license.license_issue_description", { resourceType }) }}
    </span>
  </div>
</template>
