<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/settings">
          {{ t('dashboard.settings.labs.breadcrumbNavigate') }}
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          {{ t('dashboard.settings.labs.breadcrumb') }}
        </BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="updateSettingsButtonLoading"
      :disabled="updateSettingsPermissionDisabled"
      @click="updateSettings"
    >
      {{ t('dashboard.settings.labs.saveButton') }}
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <p class="form-section-title">
        {{ t('dashboard.settings.labs.form.title') }}
      </p>

      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="labs.comments"
            :label="t('dashboard.settings.labs.form.toggleItem.label')"
            :note="t('dashboard.settings.labs.form.toggleItem.note')"
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

const { update } = useSettingStore();
const { permissions } = useUserStore();

const labs = ref<Partial<ISiteSettingsLab>>({
  comments: false,
});
const updateSettingsButtonLoading = ref(false);

const updateSettingsPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("settings:update");
  return !checkPermission;
});

const { t } = useI18n();

const metaTitle = computed(() => t("dashboard.settings.labs.metaTitle"));

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
  title: metaTitle,
});

defineOptions({
  name: "DashboardLabs",
});
</script>
