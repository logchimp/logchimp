<template>
  <button
    v-if="search && !hasSuggestions"
    :class="['w-full text-left text-neutral-700 rounded-md hover:bg-neutral-300/50', 'flex items-center gap-x-3 px-3 py-2']"
    @click="createRoadmapHandler"
  >
    <PlusIcon class="size-4" aria-hidden="true" />
    Create "{{ search }}"
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { PlusIcon } from "lucide-vue";
import type { IRoadmapPrivate } from "@logchimp/types";

import { createRoadmap } from "../../../../modules/roadmaps";

interface Props {
  search: string;
  hasSuggestions: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  hasSuggestions: false,
});
const emit = defineEmits<(e: "created", event: IRoadmapPrivate) => void>();

const loading = ref(false);

async function createRoadmapHandler() {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await createRoadmap({
      name: props.search,
    });
    const roadmap = response.data.roadmap;

    emit("created", roadmap);
    loading.value = false;
  } catch (err) {
    loading.value = false;
    console.error(err);
  }
}
</script>
