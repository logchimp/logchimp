<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <h5 class="breadcrum-item">
          Settings
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
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="siteName.value"
            label="Site name"
            placeholder="Enter board name"
            :error="siteName.error"
            @hide-error="hideSiteNameError"
          />

          <l-text
            v-model="description.value"
            label="Description"
            placeholder="Site description"
            :error="description.error"
            @hide-error="hideDescriptionError"
          />

          <toggle-item
            v-model="allowSignup"
            label="Allow signups"
            note="Allows users to create account?"
          />
        </div>

        <div class="form-column">
          <div class="dashboard-settings-logo">
            <label class="input-field-label" for="logo">Logo</label>
            <div class="dashboard-settings-logo-placeholder">
              <img
                :src="logo"
                :alt="siteName.value"
                @click="selectFileHandler"
              >
            </div>
            <input
              ref="fileSelector"
              accept="image/jpg,image/jpeg,image/png,image/svg+xml"
              type="file"
              name="logo"
              style="display: none"
              @change="uploadFile"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">
        Apperences
      </h6>
      <div class="form-columns">
        <div class="form-column">
          <color-input v-model="accentColor.value" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">
        Meta
      </h6>
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="googleAnalyticsId.value"
            label="Google Analytics"
            placeholder="UA-12345678-0"
            :error="googleAnalyticsId.error"
            @hide-error="hideGoogleAnalyticsError"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="developer_mode"
            label="Developer Mode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// modules
import {
  getSettings,
  updateSettings,
  uploadSiteLogo
} from "../../../modules/site";

// components
import LText from "../../../components/input/LText";
import Button from "../../../components/Button";
import ColorInput from "../../../components/ColorInput";
import ToggleItem from "../../../components/input/ToggleItem";

export default {
  name: "DashboardSettings",
  components: {
    // components
    LText,
    Button,
    ColorInput,
    ToggleItem
  },
  data() {
    return {
      siteName: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      logo: "",
      description: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      allowSignup: false,
      accentColor: {
        value: "484d7c",
        error: {
          show: false,
          message: ""
        }
      },
      googleAnalyticsId: {
        value: "",
        error: {
          show: false,
          message: ""
        }
      },
      developer_mode: false,
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
    hideSiteNameError(event) {
      this.siteName.error = event;
    },
    hideDescriptionError(event) {
      this.description.error = event;
    },
    hideAccentColorError(event) {
      this.accentColor.error = event;
    },
    hideGoogleAnalyticsError(event) {
      this.googleAnalyticsId.error = event;
    },
    selectFileHandler() {
      this.$refs.fileSelector.click();
    },
    async uploadFile(event) {
      const logo = event.target.files[0];

      const formData = new FormData();
      formData.append("logo", logo);

      try {
        const response = await uploadSiteLogo(formData);

        this.logo = response.data.settings.logo;

        this.$store.dispatch("settings/updateLogo", {
          logo: response.data.settings.logo
        });
      } catch (error) {
        console.error(error);
      }
    },
    async updateSettings() {
      if (!(this.siteName.value && this.accentColor.value)) {
        if (!this.siteName.value) {
          this.siteName.error.show = true;
          this.siteName.error.message = "Required";
        }

        if (!this.accentColor.value) {
          this.accentColor.error.show = true;
          this.accentColor.error.message = "Required";
        }
      }

      this.updateSettingsButtonLoading = true;

      const siteData = {
        title: this.siteName.value,
        description: this.description.value,
        accentColor: this.accentColor.value,
        googleAnalyticsId: this.googleAnalyticsId.value,
        allowSignup: this.allowSignup,
        developer_mode: this.developer_mode
      };

      try {
        const response = await updateSettings(siteData);

        this.siteName.value = response.data.settings.title;
        this.logo = response.data.settings.logo;
        this.description.value = response.data.settings.description;
        this.accentColor.value = response.data.settings.accentColor;
        this.googleAnalyticsId.value = response.data.settings.googleAnalyticsId;
        this.developer_mode = response.data.settings.developer_mode;

        this.$store.dispatch("settings/update", response.data.settings);
      } catch (error) {
        console.error(error);
      } finally {
        this.updateSettingsButtonLoading = false;
      }
    },
    async getSettings() {
      try {
        const response = await getSettings();

        this.siteName.value = response.data.settings.title;
        this.logo = response.data.settings.logo;
        this.description.value = response.data.settings.description;
        this.allowSignup = response.data.settings.allowSignup;
        this.accentColor.value = response.data.settings.accentColor;
        this.googleAnalyticsId.value = response.data.settings.googleAnalyticsId;
        this.developer_mode = response.data.settings.developer_mode;
      } catch (error) {
        console.error(error);
      }
    }
  },
  metaInfo() {
    return {
      title: "General · Settings · Dashboard"
    };
  }
};
</script>
