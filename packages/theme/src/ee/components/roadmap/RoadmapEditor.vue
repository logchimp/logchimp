<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/roadmaps">
          Roadmaps
        </BreadcrumbItem>

        <!-- Show divider & title once data loaded -->
        <template v-if="title">
          <BreadcrumbDivider />
          <BreadcrumbItem>
            {{ title }}
          </BreadcrumbItem>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="updateButtonLoading"
      :disabled="updateRoadmapButtonDisabled"
      @click="updateHandler"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="roadmap.name"
            label="Name"
            placeholder="Enter roadmap name"
            :error="roadmapFieldError"
            @hide-error="hideNameError"
          />

          <color-input v-model="roadmap.color" />
        </div>

        <div class="form-column">
          <l-text
            v-model="roadmap.url"
            label="Slug"
            placeholder="Roadmap slug url"
            :description="slimUrl"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h6 class="form-section-title">
        Privacy
      </h6>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="roadmap.display"
            label="Display on site"
            note="Show this roadmap on the site"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { IUpdateRoadmapRequestBody } from "@logchimp/types";

// modules
import { router } from "../../../router";
import { useUserStore } from "../../../store/user";
import { updateRoadmap } from "../../modules/roadmaps";
import { useDashboardRoadmaps } from "../../store/dashboard/roadmaps";

// components
import type { FormFieldErrorType } from "../../../components/ui/input/formBaseProps";
import Button from "../../../components/ui/Button.vue";
import LText from "../../../components/ui/input/LText.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import ColorInput from "../../../components/ui/ColorInput.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import BreadcrumbDivider from "../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";

const { permissions } = useUserStore();
const dashboardRoadmaps = useDashboardRoadmaps();

interface Props {
  title: string;
  roadmap: IUpdateRoadmapRequestBody;
}
const props = defineProps<Props>();

const roadmap = reactive(props.roadmap);
const updateButtonLoading = ref<boolean>(false);

const updateRoadmapButtonDisabled = computed<boolean>(() => {
  const checkPermission = permissions.includes("roadmap:update");
  return !checkPermission;
});

const slimUrl = computed(() => {
  return roadmap.url
    .replace(/[^\w]+/gi, "-")
    .trim()
    .toLowerCase();
});

const roadmapFieldError = reactive({
  show: false,
  message: "",
});

function hideNameError(event: FormFieldErrorType) {
  roadmapFieldError.show = event.show;
  roadmapFieldError.message = event.message;
}

async function updateHandler() {
  if (!roadmap.name.trim()) {
    roadmapFieldError.show = true;
    roadmapFieldError.message = "Please enter a valid roadmap name";
    return;
  }

  updateButtonLoading.value = true;

  try {
    const response = await updateRoadmap({
      ...roadmap,
    });

    if (response.status === 200) {
      dashboardRoadmaps.updateRoadmap(response.data.roadmap);
      router.push("/dashboard/roadmaps");
    }
  } catch (err) {
    console.error(err);
  } finally {
    updateButtonLoading.value = false;
  }
}

defineOptions({
  name: "DashboardRoadmapEditor",
});
</script>
