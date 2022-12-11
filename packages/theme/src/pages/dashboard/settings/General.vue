<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <h5 class="breadcrum-item">Settings</h5>
      </breadcrumbs>

      <Button
        type="primary"
        :loading="updateSettingsButtonLoading"
        :disabled="updateSettingsPermissionDisabled"
        @click="updateSettingsHandler"
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
              />
            </div>
            <input
              ref="fileSelector"
              accept="image/jpg,image/jpeg,image/png,image/svg+xml"
              type="file"
              name="logo"
              style="display: none"
              @change="uploadFile"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Apperences</h6>
      <div class="form-columns">
        <div class="form-column">
          <color-input v-model="accentColor.value" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Meta</h6>
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
          <toggle-item v-model="developer_mode" label="Developer Mode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "DashboardSettings",
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { useSettingStore } from "../../../store/settings"
import { useUserStore } from "../../../store/user"
import {
  getSettings,
  updateSettings,
  uploadSiteLogo
} from "../../../modules/site";

// components
import { FormFieldErrorType } from "../../../components/ui/input/formBaseProps";
import LText from "../../../components/ui/input/LText.vue";
import Button from "../../../components/ui/Button.vue";
import ColorInput from "../../../components/ui/ColorInput.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";

const { update } = useSettingStore()
const { permissions } = useUserStore()

const siteName = reactive({
  value: "",
  error: {
    show: false,
    message: ""
  }
})
const logo = ref("")
const description = reactive ({
  value: "",
  error: {
    show: false,
    message: ""
  }
})
const allowSignup = ref(false)
const accentColor = reactive({
  value: "484d7c",
  error: {
    show: false,
    message: ""
  }
});
const googleAnalyticsId = reactive({
  value: "",
  error: {
    show: false,
    message: ""
  }
});
const developer_mode = ref(false)
const updateSettingsButtonLoading = ref(false)

const updateSettingsPermissionDisabled = computed(() =>  {
  const checkPermission = permissions.includes("settings:update");
  return !checkPermission;
})

function hideSiteNameError(event: FormFieldErrorType) {
  siteName.error = event;
}

function hideDescriptionError(event: FormFieldErrorType) {
  description.error = event;
}

function hideAccentColorError(event: FormFieldErrorType) {
  accentColor.error = event;
}

function hideGoogleAnalyticsError(event: FormFieldErrorType) {
  googleAnalyticsId.error = event;
}

function selectFileHandler() {
  // $refs.fileSelector.click();
}

async function uploadFile(event: any) {
  const logo = event.target.files[0];

  const formData = new FormData();
  formData.append("logo", logo);

  try {
    const response = await uploadSiteLogo(formData);

    logo.value = response.data.settings.logo;
    update(response.data.settings.logo)
  } catch (error) {
    console.error(error);
  }
}

async function updateSettingsHandler() {
  if (!(siteName.value && accentColor.value)) {
    if (!siteName.value) {
      siteName.error.show = true;
      siteName.error.message = "Required";
    }

    if (!accentColor.value) {
      accentColor.error.show = true;
      accentColor.error.message = "Required";
    }
  }

  updateSettingsButtonLoading.value = true;

  const siteData = {
    title: siteName.value,
    description: description.value,
    accentColor: accentColor.value,
    googleAnalyticsId: googleAnalyticsId.value,
    allowSignup: allowSignup.value,
    developer_mode: developer_mode.value
  };

  try {
    const response = await updateSettings(siteData);

    siteName.value = response.data.settings.title;
    logo.value = response.data.settings.logo;
    description.value = response.data.settings.description;
    accentColor.value = response.data.settings.accentColor;
    googleAnalyticsId.value = response.data.settings.googleAnalyticsId;
    developer_mode.value = response.data.settings.developer_mode;

    update(response.data.settings);
  } catch (error) {
    console.error(error);
  } finally {
    updateSettingsButtonLoading.value = false;
  }
}

async function getSettingsHandler() {
  try {
    const response = await getSettings();

    siteName.value = response.data.settings.title;
    logo.value = response.data.settings.logo;
    description.value = response.data.settings.description;
    allowSignup.value = response.data.settings.allowSignup;
    accentColor.value = response.data.settings.accentColor;
    googleAnalyticsId.value = response.data.settings.googleAnalyticsId;
    developer_mode.value = response.data.settings.developer_mode;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => getSettingsHandler());

useHead({
  title: "General • Settings • Dashboard"
})
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
