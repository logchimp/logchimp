<template>
  <div>
    <div v-if="roadmaps.length > 0" class="roadmap">
      <roadmap-column
        v-for="roadmap in roadmaps"
        :key="roadmap.id"
        class="roadmap-view"
        :roadmap="roadmap"
      />
    </div>

    <infinite-scroll @infinite="getRoadmaps" :state="state">
      <template #no-results>
        <p>There are no roadmaps.</p>
      </template>
    </infinite-scroll>
  </div>
</template>

<script lang="ts">
export default {
  name: "Roadmaps",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings"

// components
import InfiniteScroll, { InfiniteScrollStateType } from "../components/ui/InfiniteScroll.vue";
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";

const { get: siteSettings } = useSettingStore()
// TODO: Add TS types
const roadmaps = ref<unknown>([])
const page = ref<number>(1)
const state = ref<InfiniteScrollStateType>();

async function getRoadmaps() {
  state.value = "LOADING";

  try {
    const response = await getAllRoadmaps();

    const newRoadmaps = response.data.roadmaps;

    if (newRoadmaps.length > 0) {
      if (page.value === 1) {
        roadmaps.value = newRoadmaps;
      } else {
        roadmaps.value.push(...newRoadmaps);
      }

      page.value += 1;
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (err) {
    console.error(err);
    state.value = "ERROR";
  }
}

useHead({
	title: "Roadmaps",
	meta: [
		{
			name: "og:title",
			content: () => `Roadmaps • ${siteSettings.title}`
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
