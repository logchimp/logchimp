<template>
  <DropdownMenuItem
    :class="[
      'w-full text-left text-neutral-700 hover:bg-neutral-300/50',
      'cursor-pointer outline-none',
      'flex items-center gap-x-4 px-4 py-3',
    ]"
    text-value=""
    @click="createRoadmapHandler"
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
import type { AxiosError } from "axios";
import type { components } from "@logchimp/api-ts-types";

import { RoadmapsEE } from "../../../../modules/roadmaps";
import { useAlertStore } from "../../../../../store/alert.ts";

interface Props {
  search: string;
}
const props = defineProps<Props>();
const emit =
  defineEmits<
    (e: "created", event: components["schemas"]["RoadmapPrivate"]) => void
  >();
const roadmapEEAPI = new RoadmapsEE();

const { add: toast } = useAlertStore();
const loading = ref(false);

async function createRoadmapHandler() {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await roadmapEEAPI.CreateRoadmap({
      name: props.search,
    });
    const roadmap = response.roadmap;

    emit("created", roadmap);
  } catch (error) {
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to create roadmap",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>
