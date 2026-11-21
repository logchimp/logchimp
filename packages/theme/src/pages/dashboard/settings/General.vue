<template>
  <DashboardPageHeader>
    <template #left>
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
      {{ t("actions.save") }}
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            :model-value="siteName.value ?? undefined"
            label="Site name"
            placeholder="Enter site name"
            :error="siteName.error"
            @update:model-value="(value) => (siteName.value = value ?? null)"
            @hide-error="setFieldError(siteName)"
          />

          <l-text
            :model-value="description.value ?? undefined"
            label="Description"
            placeholder="Site description"
            data-testid="site-description"
            :error="description.error"
            @update:model-value="(value) => (description.value = value ?? null)"
            @hide-error="setFieldError(description)"
          />

          <toggle-item
            v-model="allowSignup"
            data-testid="allow-signup"
            label="Allow signups"
            note="Allows users to create account?"
          />

          <div>
            <div class="font-medium">Blacklisted domains</div>
            <p class="input-field-label">
              The following email domains are blocked from creating new accounts
              on LogChimp.
              <a
                href="https://docs.logchimp.app/guide/user#domain-blacklist"
                target="_blank"
              >
                Learn more about domain blacklist.
              </a>
            </p>
            <div
              v-if="blockedDomains?.length"
              class="flex flex-wrap gap-2 mt-2"
            >
              <div
                v-for="domain in blockedDomains"
                :key="domain"
                class="select-none px-3 py-0.5 bg-neutral-200 rounded-lg text-sm text-neutral-800 font-medium"
              >
                {{ domain }}
              </div>
            </div>
            <div v-else-if="blockedDomains" class="text-xs text-neutral-700">
              No domains blocked.
            </div>
          </div>
        </div>

        <div class="form-column">
          <div class="grid gap-y-4">
            <div>
              <InputLabel html-for="logo_preview">Logo</InputLabel>
              <div
                :class="[
                  'size-16 border border-(--color-gray-90) bg-(--color-gray-97)',
                  'rounded-full select-none pointer-events-none overflow-hidden',
                ]"
              >
                <img
                  v-if="logo.value"
                  :src="logo.value"
                  :alt="siteName.value || ''"
                  class="w-full h-full"
                />
              </div>
            </div>
            <l-text
              :model-value="logo.value ?? undefined"
              label="Logo URL"
              data-testid="logo-url"
              :error="logo.error"
              placeholder="https://avatar-url.png"
              @update:model-value="(value) => (logo.value = value ?? null)"
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
            :error="accentColor.error"
            :model-value="accentColor.value ?? undefined"
            @update:model-value="(value) => (accentColor.value = value ?? null)"
            @hide-error="setFieldError(accentColor)"
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
            label="Google Analytics"
            placeholder="UA-12345678-0"
            :error="googleAnalyticsId.error"
            @update:model-value="
              (value) => (googleAnalyticsId.value = value ?? null)
            "
            @hide-error="hideGoogleAnalyticsError"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="developer_mode"
            data-testid="developer-mode"
            label="Developer Mode"
          />
        </div>
      </div>
    </div>

    <SettingsTelemetryForm />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@unhead/vue";
import { useI18n } from "vue-i18n";
import type { AxiosError } from "axios";
import type { components } from "@logchimp/api-ts-types";

// modules
import { useSettingStore } from "../../../store/settings";
import { useUserStore } from "../../../store/user";
import { SiteAPI, updateSettings } from "../../../modules/site";
import { useAlertStore } from "../../../store/alert.ts";

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

const siteAPI = new SiteAPI();
const { add: toast } = useAlertStore();
const { updateSettings: update } = useSettingStore();
const { permissions } = useUserStore();
const { t } = useI18n();

type TextInputField = {
  value: string | null;
  error: FormFieldErrorType;
};

function createFormFieldError(): FormFieldErrorType {
  return { show: false, message: "" };
}

// Reset stale validation errors
function resetFormStaleValidation() {
  siteName.error = createFormFieldError();
  description.error = createFormFieldError();
  logo.error = createFormFieldError();
  accentColor.error = createFormFieldError();
  googleAnalyticsId.error = createFormFieldError();
}

const siteName = reactive<TextInputField>({
  value: "",
  error: createFormFieldError(),
});
const logo = reactive<TextInputField>({
  value: "",
  error: createFormFieldError(),
});
const description = reactive<TextInputField>({
  value: "",
  error: createFormFieldError(),
});
const allowSignup = ref(false);
const accentColor = reactive<TextInputField>({
  value: "484d7c",
  error: createFormFieldError(),
});
const googleAnalyticsId = reactive<
  Omit<TextInputField, "value"> & {
    value?: string | null;
  }
>({
  value: "",
  error: createFormFieldError(),
});
const developer_mode = ref(false);
const blockedDomains = ref<Partial<string[]>>();
const updateSettingsButtonLoading = ref(false);

const updateSettingsPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("settings:update");
  return !checkPermission;
});

function setFieldError(field: TextInputField) {
  return () => {
    field.error = createFormFieldError();
  };
}

function hideGoogleAnalyticsError() {
  googleAnalyticsId.error = createFormFieldError();
}

async function updateSettingsHandler() {
  resetFormStaleValidation();

  const _title = (siteName.value || "").trim();
  const _logo = (logo.value || "").trim();
  let hasValidationError = false;

  if (!_title && !_logo) {
    const message = "Please enter a site name or a logo URL.";
    siteName.error.show = true;
    siteName.error.message = message;
    logo.error.show = true;
    logo.error.message = message;
    hasValidationError = true;
  }

  if (!accentColor.value) {
    accentColor.error.show = true;
    accentColor.error.message = "Please enter a valid color code.";
    hasValidationError = true;
  }

  if (hasValidationError) return;

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
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to save settings",
      type: "error",
    });
  } finally {
    updateSettingsButtonLoading.value = false;
  }
}

async function getSettingsHandler() {
  try {
    const response = await siteAPI.getSettings();

    siteName.value = response.settings.title;
    logo.value = response.settings.logo;
    description.value = response.settings.description;
    allowSignup.value = response.settings.allowSignup;
    accentColor.value = response.settings.accentColor;
    googleAnalyticsId.value = response.settings.googleAnalyticsId;
    developer_mode.value = response.settings.developer_mode;
    blockedDomains.value = response.settings.blockedDomains;
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
