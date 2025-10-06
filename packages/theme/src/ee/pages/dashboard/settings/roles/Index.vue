<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Roles</BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="createRoleButtonLoading"
      :disabled="createRoleButtonDisabled"
      @click="createRoleHandler"
    >
      Create
      <PhCrownSimple
        :size="20"
        weight="regular"
        class="fill-white"
      />
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <TabularView />
  </div>
</template>

<script setup lang="ts">
// packages
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import { PhCrownSimple } from "@phosphor-icons/vue";

// modules
import { router } from "../../../../../router";
import { useUserStore } from "../../../../../store/user";
import { createRole } from "../../../../modules/roles";
import { useDashboardRoles } from "../../../../store/dashboard/roles";

// components
import Button from "../../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import TabularView from "../../../../components/dashboard/roles/TabularView.vue";

const { permissions } = useUserStore();
const dashboardRoles = useDashboardRoles();

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
