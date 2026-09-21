<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem>
          {{ t("settings.billing.billing_title") }}
        </BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div v-if="IS_DEV" class="form-section">
      <LocalLicenseAlert />
    </div>

    <div class="form-section">
      <h6 class="form-section-title">
        {{ t("settings.billing.manage_plan") }}
      </h6>

      <div class="form-columns">
        <i18n-t
          keypath="settings.billing.on_logchimp_pilot"
          tag="div"
          class="form-column"
        >
          <template #link>
            <a class="font-medium" :href="DEFAULT_LOGCHIMP_PILOT_URL">
              {{ t("settings.billing.manage_your_billing") }}
            </a>
          </template>
        </i18n-t>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { I18nT, useI18n } from "vue-i18n";
import { useHead } from "@vueuse/head";

// components
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import { DEFAULT_LOGCHIMP_PILOT_URL, IS_DEV } from "../../../../constants";
import LocalLicenseAlert from "../../../components/license/LocalLicenseAlert.vue";

const { t } = useI18n();

useHead({
  title: () =>
    `${t("settings.billing.billing_title")} • ${t("settings.settings_title")} • ${t("dashboard_title")}`,
});

defineOptions({
  name: "DashboardSettings",
});
</script>
