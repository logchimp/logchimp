<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <router-link to="/dashboard/settings" class="breadcrum-item">
          Settings
        </router-link>
        <div class="breadcrum-divider">
          /
        </div>
        <h5 class="breadcrum-item">
          Labs
        </h5>
      </div>

      <Button
        type="primary"
        :loading="updateSettingsButtonLoading"
        :disabled="updateSettingsPermissionDisabled"
        @click="updateSettings"
      >
        Save
      </Button>
    </header>

    <div class="form-section">
      <p class="form-section-title">
        Beta features
      </p>

      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="labs.comments"
            label="Comments"
            note="Allow users to comment on posts"
          />
        </div>

        <div class="form-column" />
      </div>
    </div>
  </div>
</template>

<script>
// modules
import {
  getLabsSettings,
  updateLabsSettings
} from "../../../modules/site";

// components
import Button from "../../../components/Button";
import ToggleItem from "../../../components/input/ToggleItem";

export default {
  name: "DashboardLabs",
  components: {
    // components
    Button,
    ToggleItem
  },
  data() {
    return {
      labs: {},
      updateSettingsButtonLoading: false
    };
  },
  computed: {
    updateSettingsPermissionDisabled() {
      const permissions = this.$store.getters["user/getPermissions"];
      const checkPermission = permissions.includes("settings:update");
      return !checkPermission;
    }
  },
  created() {
    this.getSettings();
  },
  methods: {
    async updateSettings() {
      this.updateSettingsButtonLoading = true;

      try {
        await updateLabsSettings(this.labs);

        this.$store.dispatch("settings/update", {
          labs: this.labs
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.updateSettingsButtonLoading = false;
      }
    },
    async getSettings() {
      try {
        const response = await getLabsSettings();
        this.labs = response.data.labs;
      } catch (error) {
        console.error(error);
      }
    }
  },
  metaInfo() {
    return {
      title: "Labs · Settings · Dashboard"
    };
  }
};
</script>
