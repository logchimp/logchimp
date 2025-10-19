<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Billing</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <LocalLicenseAlert />
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Manage Plan</h6>

      <div class="form-columns">
        <div class="form-column">
          You can manage your Billing plan <a class="font-medium" :href="DEFAULT_LOGCHIMP_PILOT_URL">here</a>.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";

// components
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import { DEFAULT_LOGCHIMP_PILOT_URL } from "../../../../constants.ts";
import LocalLicenseAlert from "../../../components/license/LocalLicenseAlert.vue";

useHead({
  title: "Billing • Settings • Dashboard",
});

defineOptions({
  name: "DashboardSettings",
});
</script>
