<template>
  <div
    v-if="data.length === 0"
    class="text-neutral-500 text-sm text-center"
  >
    Add your first comment
  </div>
  <div v-else class="grid gap-y-5">
    <activity-item
      v-for="item in data"
      :key="item.id"
      :activity="item"
    />
  </div>
</template>

<script setup lang="ts">
import type { IPostActivity } from "@logchimp/types";
import ActivityItem from "../../activity/ActivityItem.vue";

interface Props {
  data: IPostActivity[];
}

defineProps<Props>();

defineOptions({
  name: "PostActivityList",
});
</script>

