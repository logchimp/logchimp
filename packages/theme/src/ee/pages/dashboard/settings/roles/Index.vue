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
          <div class="table-data flex-1">
            {{ role.name }}
          </div>
          <div class="table-icon-group boards-table-icons">
            <router-link
              :to="`/dashboard/settings/roles/${role.id}/settings`"
              class="table-data table-data-icon"
            >
              <settings-icon />
            </router-link>
            <dropdown-wrapper v-if="settings.developer_mode">
              <template #toggle>
                <div
                  class="
                    table-data table-data-icon
                    boards-table-icon-settings
                    dropdown-menu-icon
                  "
                >
                  <more-icon />
                </div>
              </template>
              <template #default="dropdown">
                <dropdown v-if="dropdown.active">
                  <dropdown-item
                    @click="useCopyText(role.id)"
                  >
                    <template #icon>
                      <copy-icon />
                    </template>
                    Copy ID
                  </dropdown-item>
                </dropdown>
              </template>
            </dropdown-wrapper>
          </div>
        </div>

        <infinite-scroll @infinite="dashboardRoles.fetchRoles" :state="dashboardRoles.state" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "DashboardRoles",
};
</script>

<script setup lang="ts">
// packages
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";
import {
  Settings as SettingsIcon,
  Clipboard as CopyIcon,
  MoreHorizontal as MoreIcon
} from "lucide-vue";

// modules
import { router } from "../../../../../router";
import { useSettingStore } from "../../../../../store/settings"
import { useUserStore } from "../../../../../store/user"
import { createRole } from "../../../../modules/roles";
import { useCopyText } from "../../../../../hooks";
import { useDashboardRoles } from "../../../../../store/dashboard/roles.ts";

// components
import InfiniteScroll from "../../../../../components/ui/InfiniteScroll.vue";
import Button from "../../../../../components/ui/Button.vue";
import DropdownWrapper from "../../../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../../../components/ui/dropdown/DropdownItem.vue";
import Breadcrumbs from "../../../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../../../components/ui/breadcrumbs/BreadcrumbItem.vue";

const { settings } = useSettingStore()
const { permissions  } = useUserStore()
const dashboardRoles = useDashboardRoles();

const createRoleButtonLoading = ref(false)

const createRoleButtonDisabled = computed(() => {
	const checkPermission = permissions.includes("role:create");
	return !checkPermission;
})

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
	title: "Roles • Settings • Dashboard"
})
</script>
