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
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="table-container">
      <div class="table-header">
        <div class="table-header-item flex-1">name</div>
        <div class="table-header-item" />
      </div>
      <div class="table-body">
        <div v-for="role in dashboardRoles.roles" :key="role.id" class="table-row">
          <DashboardRolesTabularItem :role="role" />
        </div>

        <infinite-scroll :on-infinite="dashboardRoles.fetchRoles" :state="dashboardRoles.state" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// packages
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../../../router";
import { useUserStore } from "../../../../../store/user";
import { createRole } from "../../../../modules/roles";
import { useDashboardRoles } from "../../../../../store/dashboard/roles.ts";

// components
import InfiniteScroll from "../../../../../components/ui/InfiniteScroll.vue";
import Button from "../../../../../components/ui/Button.vue";
import Breadcrumbs from "../../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardRolesTabularItem from "../../../../components/dashboard/roles/TabularItem.vue";

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

    const roleId = response.data.role;
    router.push(`/dashboard/settings/roles/${roleId.id}/settings`);
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
