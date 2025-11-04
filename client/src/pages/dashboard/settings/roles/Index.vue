<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <div class="breadcrum-item">
          Roles
        </div>
      </div>

      <Button
        type="primary"
        :loading="createRoleButtonLoading"
        :disabled="createRoleButtonDisabled"
        @click="createRole"
      >
        Create
      </Button>
    </header>

    <div class="table-container">
      <div class="table-header">
        <div class="table-header-item">
          name
        </div>
        <div class="table-header-item" />
      </div>
      <div class="table-body">
        <div
          v-for="role in roles"
          :key="role.id"
          class="table-row"
        >
          <div class="table-data">
            {{ role.name }}
          </div>
          <div class="table-icon-group boards-table-icons">
            <router-link
              :to="`/dashboard/settings/roles/${role.id}/settings`"
              class="table-data table-data-icon"
            >
              <settings-icon />
            </router-link>
            <dropdown-wrapper v-if="isDeveloperMode">
              <template #toggle>
                <div
                  class="table-data table-data-icon boards-table-icon-settings dropdown-menu-icon"
                >
                  <more-icon />
                </div>
              </template>
              <template #default="dropdown">
                <dropdown v-if="dropdown.active">
                  <dropdown-item
                    @click="copyText(role.id)"
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
      </div>
    </div>
  </div>
</template>

<script>
// packages
import {
  Settings as SettingsIcon,
  Clipboard as CopyIcon,
  MoreHorizontal as MoreIcon
} from "lucide-vue";

// modules
import { getAllRoles, createRole } from "../../../../modules/roles";

// components
import Button from "../../../../components/Button";
import DropdownWrapper from "../../../../components/dropdown/DropdownWrapper";
import Dropdown from "../../../../components/dropdown/Dropdown";
import DropdownItem from "../../../../components/dropdown/DropdownItem";

export default {
  name: "SettingsRoles",
  components: {
    // components
    Button,
    DropdownWrapper,
    Dropdown,
    DropdownItem,

    // icons
    SettingsIcon,
    CopyIcon,
    MoreIcon
  },
  data() {
    return {
      roles: [],
      createRoleButtonLoading: false
    };
  },
  computed: {
    createRoleButtonDisabled() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("role:create");
      return !checkPermission;
    },
    isDeveloperMode() {
      return this.$store.getters["settings/get"].developer_mode;
    }
  },
  created() {
    this.getRoles();
  },
  methods: {
    async createRole() {
      this.createRoleButtonLoading = true;
      try {
        const response = await createRole();

        const roleId = response.data.role;
        this.$router.push(`/dashboard/settings/roles/${roleId}/settings`);
      } catch (error) {
        console.error(error);
      } finally {
        this.createRoleButtonLoading = false;
      }
    },
    async getRoles() {
      try {
        const response = await getAllRoles();

        this.roles = response.data.roles;
      } catch (error) {
        console.error(error);
      }
    },
    copyText(text) {
      navigator.clipboard.writeText(text).then().catch(err => console.log(err));
    }
  }
};
</script>
