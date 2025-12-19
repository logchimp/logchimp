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
      <alert
        title="We are working on defining its pricing model at the moment."
        type="warning"
      >
        <template #icon>
          <PhCrownSimple
            :size="24"
            weight="fill"
            class="fill-(--color-yellow-800)"
          />
        </template>
        <template #description>
          <p> Please keep in mind that a few <strong>free</strong> plan features will be converted to paid plans.
          </p>
        </template>
      </alert>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Active Plan</h6>

      <div class="form-columns">
        <div class="form-column">You're currently on <strong>free</strong> plan.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { PhCrownSimple } from "@phosphor-icons/vue";

// components
import { Alert } from "../../../../components/ui/Alert";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";

useHead({
  title: "Billing • Settings • Dashboard",
});

defineOptions({
  name: "DashboardSettings",
});
</script>

<style lang='sass'>
.dashboard-settings-logo
  margin-bottom: 1rem
  display: flex
  flex-direction: column

.dashboard-settings-logo-placeholder
  width: 4rem
  height: 4rem
  background-color: var(--color-gray-97)
  border: 1px solid var(--color-gray-90)
  border-radius: 3rem
  cursor: pointer
  user-select: none

  img
    width: 100%
</style>
