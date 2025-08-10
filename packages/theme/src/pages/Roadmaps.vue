<template>
  <div>
    
    <div  
     v-if="withPermissions" 
     class="flex items-center justify-end mb-2"
     >
      <label for="filter" class="mr-2 text-sm text-gray-700">Filter:</label>
      <select
        id="filter"
        v-model="selectedFilter"
        class="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700  bg-white"
  >
      >
        <option value="all">All</option>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </select>
    </div>

    
    <div
      v-if="filteredRoadmaps.length > 0"
      :class="[
        'overflow-x-auto h-[500px]',
        'grid grid-flow-col gap-x-4 md:gap-x-6 auto-cols-[minmax(22rem,24rem)]'
      ]"
    >
      <roadmap-column
        v-for="roadmap in filteredRoadmaps"
        :key="roadmap.id"
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
import { computed, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { getAllRoadmaps } from "../modules/roadmaps";
import { useSettingStore } from "../store/settings"

// components
import InfiniteScroll, { type InfiniteScrollStateType } from "../components/ui/InfiniteScroll.vue";
import RoadmapColumn from "../ee/components/roadmap/RoadmapColumn.vue";

const { get: siteSettings } = useSettingStore()
// TODO: Add TS types
const roadmaps = ref<unknown[]>([])
const withPermissions = ref<boolean>(false);
const selectedFilter = ref<string>("all")
const page = ref<number>(1)
const state = ref<InfiniteScrollStateType>();


const filteredRoadmaps = computed(() => {
  if (selectedFilter.value === "public") {
    return roadmaps.value.filter((r: any) => r.display === true);
  } else if (selectedFilter.value === "private") {
    return roadmaps.value.filter((r: any) => r.display === false);
  }
  return roadmaps.value; 
});

async function getRoadmaps() {
  state.value = "LOADING";

  try {
    const response = await getAllRoadmaps();

    const newRoadmaps = response.data.roadmaps
    withPermissions.value = response.data.withPermissions;
    
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
