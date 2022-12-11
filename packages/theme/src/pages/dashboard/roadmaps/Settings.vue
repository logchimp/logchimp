<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <router-link to="/dashboard/roadmaps" class="breadcrum-item">
          Roadmaps
        </router-link>

        <!-- Show divider & title once data loaded -->
        <template v-if="title">
          <div class="breadcrum-divider">
            /
          </div>
          <h5 class="breadcrum-item">
            {{ title }}
          </h5>
        </template>
      </breadcrumbs>

      <Button
        type="primary"
        :loading="updateButtonLoading"
        :disabled="updateRoadmapButtonDisabled"
        @click="updateHandler"
      >
        Save
      </Button>
    </header>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="roadmap.name"
            label="Name"
            placeholder="Enter roadmap name"
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

<script lang="ts">
export default {
	name: "DashbordRoadmapSettings"
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../router";
import { useUserStore } from "../../../store/user";
import { getRoadmapByUrl, updateRoadmap } from "../../../modules/roadmaps";

// components
import Button from "../../../components/ui/Button.vue";
import LText from "../../../components/ui/input/LText.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import ColorInput from "../../../components/ui/ColorInput.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";

const { permissions } = useUserStore()

const title = ref("");
const roadmap = reactive({
	id: "",
	name: "",
	url: "",
	color: "",
	display: false
})
const updateButtonLoading = ref(false)

const updateRoadmapButtonDisabled = computed(() => {
	const checkPermission = permissions.includes("roadmap:update");
	return !checkPermission;
})

const slimUrl = computed(() => {
	return roadmap.url
		.replace(/[^\w]+/gi, "-")
		.trim()
		.toLowerCase();
})

async function updateHandler() {
	updateButtonLoading.value = true;

	try {
		const response = await updateRoadmap({
			...roadmap
		});

		if (response.status === 200) {
			router.push("/dashboard/roadmaps");
		}
	} catch (err) {
		console.error(err);
	} finally {
		updateButtonLoading.value = false;
	}
}

async function getRoadmap() {
	const route = router.currentRoute.value;

  const url = route.params.url.toString();
  try {
    const response = await getRoadmapByUrl(url);

    Object.assign(roadmap, response.data.roadmap)
    title.value = response.data.roadmap.name;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => getRoadmap());

useHead({
	title: () => `${title.value ? `${title.value} • `: ''}Roadmap • Dashboard`
})
</script>
