<template>
  <DropdownMenuItem
    :class="[
      'w-full text-left text-neutral-700 hover:bg-neutral-300/50',
      'cursor-pointer outline-none',
      'flex items-center gap-x-4 px-4 py-3'
    ]"
    @click="createRoadmapHandler"
    textValue=""
    @select="(e: Event) => e.preventDefault()"
  >
    <PlusIcon class="size-4" aria-hidden="true" />
    Create "{{ search }}"
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DropdownMenuItem } from "reka-ui";
import { PlusIcon } from "lucide-vue";
import type { IRoadmapPrivate } from "@logchimp/types";

import { createRoadmap } from "../../../../modules/roadmaps";

interface Props {
  search: string;
}
const props = defineProps<Props>();
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
