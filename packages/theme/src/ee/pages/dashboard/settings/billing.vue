<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Billing</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section" v-if="IS_DEV">
      <LocalLicenseAlert />
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Manage Plan</h6>

      <div class="form-columns">
        <div class="form-column">
          <a class="font-medium" :href="DEFAULT_LOGCHIMP_PILOT_URL">Manage your billing plan</a> on LogChimp Pilot.
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
import { DEFAULT_LOGCHIMP_PILOT_URL, IS_DEV } from "../../../../constants";
import LocalLicenseAlert from "../../../components/license/LocalLicenseAlert.vue";

useHead({
  title: "Billing • Settings • Dashboard",
});

defineOptions({
  name: "DashboardSettings",
});
</script>
