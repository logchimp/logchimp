<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <h5 class="breadcrum-item">Billing</h5>
      </breadcrumbs>
    </header>

    <div class="form-section">
      <alert
        title="We are working on defining its pricing model at the moment."
        type="warning"
      >
        <template #description>
          <p>
            Please keep in mind that a few <strong>free</strong> plan features will be converted to paid plans.
          </p>
        </template>
      </alert>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">Active Plan</h6>

      <div class="form-columns">
        <div class="form-column">
          You're currently on <strong>free</strong> plan.
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
import { Alert } from "../../../components/ui/Alert";
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
const description = reactive({
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
  title: "Billing • Settings • Dashboard"
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
