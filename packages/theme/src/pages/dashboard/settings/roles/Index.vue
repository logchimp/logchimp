<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <div class="breadcrum-item">Roles</div>
      </breadcrumbs>

      <Button
        type="primary"
        :loading="createRoleButtonLoading"
        :disabled="createRoleButtonDisabled"
        @click="createRoleHandler"
      >
        Create
      </Button>
    </header>

    <div class="table-container">
      <div class="table-header">
        <div class="table-header-item flex-1">name</div>
        <div class="table-header-item" />
      </div>
      <div class="table-body">
        <div v-for="role in roles" :key="role.id" class="table-row">
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

        <infinite-scroll @infinite="getRoles" :state="state" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
	name: "DashboardRoles",
}
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
import { router } from "../../../../router";
import { useSettingStore } from "../../../../store/settings"
import { useUserStore } from "../../../../store/user"
import { getAllRoles, createRole } from "../../../../modules/roles";
import { useCopyText } from "../../../../hooks";

// components
import InfiniteScroll, { InfiniteScrollStateType } from "../../../../components/ui/InfiniteScroll.vue";
import Button from "../../../../components/ui/Button.vue";
import DropdownWrapper from "../../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../../components/ui/dropdown/DropdownItem.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";

const { settings } = useSettingStore()
const { permissions  } = useUserStore()

// TODO: Add TS types
const roles = ref<any>([])
const createRoleButtonLoading = ref(false)
const state = ref<InfiniteScrollStateType>()

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

async function getRoles() {
  state.value = 'LOADING'

	try {
		const response = await getAllRoles();

		roles.value = response.data.roles;
    state.value = 'COMPLETED'
	} catch (error) {
		console.error(error);
    state.value = 'ERROR'
	}
}

useHead({
	title: "Roles • Settings • Dashboard"
})
</script>
