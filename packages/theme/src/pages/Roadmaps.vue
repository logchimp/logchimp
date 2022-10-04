<template>
  <div class="roadmap">
    <roadmap-view
      v-for="roadmap in roadmaps"
      :key="roadmap.id"
      class="roadmap-view"
      :roadmap="roadmap"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";

// components
import RoadmapView from "../components/RoadmapView.vue";

import { useSettingStore } from "../store/settings"

const { get: siteSettings } = useSettingStore()
// TODO: Add TS types
const roadmaps = ref<any>([])

async function getRoadmaps() {
	try {
		const response = await getAllRoadmaps();
		roadmaps.value = response.data.roadmaps;
	} catch (err) {
		console.error(err);
	}
}

onMounted(() => getRoadmaps())

useHead({
	title: "Roadmaps",
	meta: [
		{
			name: "og:title",
			content: `Roadmaps · ${siteSettings.title}`
		}
	]
})
</script>
