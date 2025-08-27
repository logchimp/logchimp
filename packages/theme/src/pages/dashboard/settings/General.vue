<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Settings</BreadcrumbItem>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="updateSettingsButtonLoading"
      :disabled="updateSettingsPermissionDisabled"
      @click="updateSettingsHandler"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            :model-value="siteName.value ?? undefined"
            @update:model-value="(value) => siteName.value = value ?? null"
            label="Site name"
            placeholder="Enter board name"
            :error="siteName.error"
            @hide-error="hideSiteNameError"
          />

          <l-text
            :model-value="description.value ?? undefined"
            @update:model-value="(value) => description.value = value ?? null"
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
                v-if="logo"
                :src="logo"
                :alt="siteName.value || ''"
                @click="selectFileHandler"
              />
            </div>
            <input
              ref="logoInputRef"
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
      <h6 class="form-section-title">Appearances</h6>
      <div class="form-columns">
        <div class="form-column">
          <color-input
            :model-value="accentColor.value ?? undefined"
            @update:model-value="(value) => accentColor.value = value ?? null"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Meta</h6>
      <div class="form-columns">
        <div class="form-column">
          <l-text
            :model-value="googleAnalyticsId.value ?? undefined"
            @update:model-value="(value) => googleAnalyticsId.value = value ?? null"
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

    <SettingsTelemetryForm />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { useSettingStore } from "../../../store/settings";
import { useUserStore } from "../../../store/user";
import {
  getSettings,
  updateSettings,
  uploadSiteLogo,
} from "../../../modules/site";

// components
import type { FormFieldErrorType } from "../../../components/ui/input/formBaseProps";
import LText from "../../../components/ui/input/LText.vue";
import Button from "../../../components/ui/Button.vue";
import ColorInput from "../../../components/ui/ColorInput.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import SettingsTelemetryForm from "../../../components/dashboard/settings/general/Telemetry.vue";

const { update } = useSettingStore();
const { permissions } = useUserStore();

type TextInputField = {
  value: string | null;
  error: {
    show: boolean;
    message: string;
  };
};

const siteName = reactive<TextInputField>({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const logo = ref<string | null>("");
const logoInputRef = ref<HTMLInputElement | null>(null);
const description = reactive<TextInputField>({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const allowSignup = ref(false);
const accentColor = reactive<TextInputField>({
  value: "484d7c",
  error: {
    show: false,
    message: "",
  },
});
const googleAnalyticsId = reactive<TextInputField>({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const developer_mode = ref(false);
const updateSettingsButtonLoading = ref(false);

const updateSettingsPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("settings:update");
  return !checkPermission;
});

function hideSiteNameError(event: FormFieldErrorType) {
  siteName.error = event;
}

function hideDescriptionError(event: FormFieldErrorType) {
  description.error = event;
}

// function hideAccentColorError(event: FormFieldErrorType) {
//   accentColor.error = event;
// }

function hideGoogleAnalyticsError(event: FormFieldErrorType) {
  googleAnalyticsId.error = event;
}

function selectFileHandler() {
  if (!logoInputRef.value) return;
  logoInputRef.value.click();
}

async function uploadFile(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length === 0) return;
  const file = (target.files || [])[0];

  const formData = new FormData();
  formData.append("logo", file);

  try {
    const response = await uploadSiteLogo(formData);

    logo.value = response.data.settings.logo;
    update(response.data.settings.logo);
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
    developer_mode: developer_mode.value,
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
  title: "General • Settings • Dashboard",
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
