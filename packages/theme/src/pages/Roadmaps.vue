<template>
	<client-error v-if="error">
		<p>Something went wrong!</p>
	</client-error>
	<div v-else class="roadmap">
		<roadmap-column
			v-for="roadmap in roadmaps"
			:key="roadmap.id"
			class="roadmap-view"
			:roadmap="roadmap"
		/>
	</div>
</template>

<script lang="ts">
export default {
	name: "Roadmaps",
}
</script>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings"

// components
import RoadmapColumn from "../components/roadmap/RoadmapColumn.vue";
import ClientError from "../components/ui/ClientError.vue";

const { get: siteSettings } = useSettingStore()
// TODO: Add TS types
const roadmaps = ref<any>([])
const error = ref<boolean>(false)

async function getRoadmaps() {
	try {
		const response = await getAllRoadmaps();
		roadmaps.value = response.data.roadmaps;
	} catch (err) {
		console.error(err);
		error.value = true;
	}
}

onMounted(() => getRoadmaps())

useHead({
	title: "Roadmaps",
	meta: [
		{
			name: "og:title",
			content: `Roadmaps • ${siteSettings.title}`
		}
	]
})
</script>

<style lang='sass'>
.roadmap
	display: grid
	grid-auto-flow: column
	grid-auto-columns: minmax(22rem, 24rem)
	grid-column-gap: 1rem
	overflow-x: scroll
</style>
