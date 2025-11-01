<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Roles</BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <UpgradeTooltip :has-valid-license="hasValidLicense">
      <Button
        type="primary"
        :loading="createRoleButtonLoading"
        :disabled="createRoleButtonDisabled"
        @click="createRoleHandler"
      >
        Create
        <LicenseCrown v-if="!hasValidLicense" />
      </Button>
    </UpgradeTooltip>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <LicenseRequired>
      <TabularView />
    </LicenseRequired>
  </div>
</template>

<script setup lang="ts">
// packages
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import { storeToRefs } from "pinia";

// modules
import { router } from "../../../../../router";
import { useUserStore } from "../../../../../store/user";
import { createRole } from "../../../../modules/roles";
import { useDashboardRoles } from "../../../../store/dashboard/roles";
import { useSettingsEEStore } from "../../../../store/settings";

// components
import Button from "../../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import LicenseRequired from "../../../../components/LicenseRequired.vue";
import TabularView from "../../../../components/dashboard/roles/TabularView.vue";
import UpgradeTooltip from "../../../../components/UpgradeTooltip.vue";
import LicenseCrown from "../../../../components/icons/LicenseCrown.vue";

const { permissions } = useUserStore();
const dashboardRoles = useDashboardRoles();
const settingsEEStore = useSettingsEEStore();
const { hasValidLicense } = storeToRefs(settingsEEStore);

const createRoleButtonLoading = ref(false);

const createRoleButtonDisabled = computed(() => {
  const checkPermission = permissions.includes("role:create");
  return !checkPermission;
});

async function createRoleHandler() {
  createRoleButtonLoading.value = true;
  try {
    const response = await createRole();

    const role = response.data.role;
    router.push(`/dashboard/settings/roles/${role.id}/settings`);
    dashboardRoles.appendRole(role);
  } catch (error) {
    console.error(error);
  } finally {
    createRoleButtonLoading.value = false;
  }
}

useHead({
  title: "Roles • Settings • Dashboard",
});

defineOptions({
  name: "DashboardRoles",
});
</script>
