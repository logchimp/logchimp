<template>
  <Dialog :open="open" @update:open="e => $emit('close', e)">
    <template #title>Delete Roadmap</template>

    <template #description>
      <div class="gap-y-2">
       <p>
        Are you sure you want to delete this roadmap? This action cannot be undone.
       </p>
        <p>
          Posts linked to this roadmap won’t be deleted, but they’ll be unassigned from it.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          class="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          @click="() => $emit('close', false)"
        >
          Cancel
        </button>
        <button
          class="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          @click="deleteRoadmapHandler"
          :disabled="loading"
        >
          {{ loading ? "Deleting..." : "Delete" }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";

import Dialog from "../../../../../components/ui/Dialog/Dialog.vue";
import { deleteRoadmap } from "../../../../modules/roadmaps";
import { roadmapKey } from "./options";
import { useDashboardRoadmaps } from "../../../../store/dashboard/roadmaps";

const roadmap = inject(roadmapKey);
const dashboardRoadmaps = useDashboardRoadmaps();

interface Props {
  open: boolean;
}
defineProps<Props>();
defineEmits<(e: "close", value: boolean) => void>();
const loading = ref<boolean>(false);

async function deleteRoadmapHandler() {
  if (!roadmap) return;

  if (loading.value) return;
  loading.value = true;

  try {
    const response = await deleteRoadmap({ id: roadmap.id });

    if (response.status === 204) {
      dashboardRoadmaps.removeRoadmap(roadmap.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>