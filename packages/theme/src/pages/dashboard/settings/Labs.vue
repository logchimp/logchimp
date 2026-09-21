<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/settings">
          {{ t("settings.settings_title") }}
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          {{ t("settings.labs.labs_title") }}
        </BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="updateSettingsButtonLoading"
      :disabled="updateSettingsPermissionDisabled"
      @click="updateSettings"
    >
      {{ t("actions.save") }}
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <p class="form-section-title">
        {{ t("settings.labs.beta_features_title") }}
      </p>

      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="labs.voteOnBehalf"
            :label="t('settings.labs.vote_on_behalf.label')"
            :note="t('settings.labs.vote_on_behalf.note')"
          />
        </div>

        <div class="form-column" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { ISiteSettingsLab } from "@logchimp/types";
import { useI18n } from "vue-i18n";

// modules
import { useSettingStore } from "../../../store/settings";
import { useUserStore } from "../../../store/user";
import { getLabsSettings, updateLabsSettings } from "../../../modules/site";

// components
import Button from "../../../components/ui/Button.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import BreadcrumbDivider from "../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";

const { updateLabs: update } = useSettingStore();
const { permissions } = useUserStore();

const labs = ref<Partial<ISiteSettingsLab>>({
  voteOnBehalf: false,
});
const updateSettingsButtonLoading = ref(false);

const updateSettingsPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("settings:update");
  return !checkPermission;
});

const { t } = useI18n();

async function updateSettings() {
  updateSettingsButtonLoading.value = true;

  try {
    await updateLabsSettings(labs.value);

    update(labs.value);
  } catch (error) {
    console.error(error);
  } finally {
    updateSettingsButtonLoading.value = false;
  }
}
async function getSettings() {
  try {
    const response = await getLabsSettings();
    labs.value = response.data.labs;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => getSettings());

useHead({
  title: () =>
    `${t("settings.labs.labs_title")} • ${t("settings.settings_title")} • ${t("dashboard_title")}`,
});

defineOptions({
  name: "DashboardLabs",
});
</script>
