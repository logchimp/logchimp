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
      <h6 class="form-section-title">Branding</h6>
      <p class="text-sm text-neutral-600 mb-4">
        At least one of Site name or Logo is required for site branding.
      </p>
      <div class="form-columns">
        <div class="form-column">
          <l-text
            :model-value="siteName.value ?? undefined"
            @update:model-value="(value) => siteName.value = value ?? null"
            label="Site name"
            placeholder="Enter site name"
            :error="siteName.error"
            @hide-error="hideSiteNameError"
          />

          <l-text
            :model-value="description.value ?? undefined"
            @update:model-value="(value) => description.value = value ?? null"
            label="Description"
            placeholder="Site description"
            data-testid="site-description"
            :error="description.error"
            @hide-error="hideDescriptionError"
          />

          <toggle-item
            data-testid="allow-signup"
            v-model="allowSignup"
            label="Allow signups"
            note="Allows users to create account?"
          />
        </div>

        <div class="form-column">
          <div class="grid gap-y-4">
           <div>
             <InputLabel html-for="logo_preview">Logo</InputLabel>
             <div
               :class="[
                'size-16 border border-(--color-gray-90) bg-(--color-gray-97)',
                'rounded-full select-none pointer-events-none overflow-hidden'
              ]"
             >
               <img
                 v-if="logo"
                 :src="logo"
                 :alt="siteName.value || ''"
                 class="w-full h-full"
               />
             </div>
           </div>
            <l-text
              :model-value="logo ?? undefined"
              @update:model-value="(value) => logo = value ?? null"
              label="Logo URL"
              data-testid="logo-url"
              placeholder="https://avatar-url.png"
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
          <toggle-item
            data-testid="developer-mode"
            v-model="developer_mode" label="Developer Mode" />
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
import { getSettings, updateSettings } from "../../../modules/site";

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
import InputLabel from "../../../components/ui/input/InputLabel.vue";

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

async function updateSettingsHandler() {
  // Reset errors
  siteName.error.show = false;
  accentColor.error.show = false;

  let hasError = false;

  // Check if at least one of site name or logo is provided
  if (!siteName.value?.trim() && !logo.value?.trim()) {
    siteName.error.show = true;
    siteName.error.message = "Either Site name or Logo is required";
    hasError = true;
  }

  // Accent color is still required
  if (!accentColor.value) {
    accentColor.error.show = true;
    accentColor.error.message = "Required";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  updateSettingsButtonLoading.value = true;

  const siteData = {
    title: siteName.value,
    description: description.value,
    accentColor: accentColor.value,
    logo: logo.value,
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
