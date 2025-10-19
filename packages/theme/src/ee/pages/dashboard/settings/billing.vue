<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>{{ t('ee.dashboard.settings.billing.breadcrumb') }}</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <alert
        :title="t('ee.dashboard.settings.billing.alert.title')"
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
          <p v-html="t('ee.dashboard.settings.billing.alert.description')">
          </p>
        </template>
      </alert>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">{{ t('ee.dashboard.settings.billing.activePlan.title') }}</h6>

      <div class="form-columns">
        <div class="form-column" v-html="t('ee.dashboard.settings.billing.activePlan.current')"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import { PhCrownSimple } from "@phosphor-icons/vue";
import { useI18n } from "vue-i18n";

// components
import { Alert } from "../../../../components/ui/Alert";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";

const { t } = useI18n();

useHead({
  title: t("ee.dashboard.settings.billing.metaTitle"),
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
