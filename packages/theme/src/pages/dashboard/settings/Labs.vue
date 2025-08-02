<template>
  <DashboardPageHeader>
    <Breadcrumbs>
      <BreadcrumbItem to="/dashboard/settings">
        Settings
      </BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>
        Labs
      </BreadcrumbItem>
    </Breadcrumbs>

    <Button
      type="primary"
      :loading="updateSettingsButtonLoading"
      :disabled="updateSettingsPermissionDisabled"
      @click="updateSettings"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
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

<script lang="ts">
export default {
  name: "DashboardLabs",
};
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { useSettingStore } from "../../../store/settings"
import { useUserStore } from "../../../store/user"
import {
	type LabsType,
  getLabsSettings,
  updateLabsSettings
} from "../../../modules/site";

// components
import Button from "../../../components/ui/Button.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import PageNotFound from "../../pageNotFound.vue";
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import BreadcrumbDivider from "../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";

const { update } = useSettingStore()
const { permissions } = useUserStore()

const labs = ref<LabsType>({
	comments: false,
})
const updateSettingsButtonLoading = ref(false)

const updateSettingsPermissionDisabled = computed(() => {
	const checkPermission = permissions.includes("settings:update");
	return !checkPermission;
})

async function updateSettings() {
	updateSettingsButtonLoading.value = true;

	try {
		await updateLabsSettings(labs.value);

		update(labs.value)
	} catch (error) {
		console.error(error);
	} finally {
		updateSettingsButtonLoading.value = false;
	}
}
async function getSettings() {
	try {
		const response = await getLabsSettings();
		labs.value = response.data.labs;
	} catch (error) {
		console.error(error);
	}
}

onMounted(() => getSettings());

useHead({
	title: "Labs • Settings • Dashboard"
})
</script>
