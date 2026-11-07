<template>
  <div v-if="data.length === 0" class="text-neutral-500 text-sm text-center">
    Add your first comment
  </div>
  <div v-else class="grid gap-y-5">
    <activity-item
      v-for="item in data"
      :key="item.id"
      :post-id="postId"
      :activity="item"
    />
  </div>
</template>

<script setup lang="ts">
import type { components } from "@logchimp/api-ts-types";
import ActivityItem from "../../activity/ActivityItem.vue";

interface Props {
  postId: string;
  data: components["schemas"]["PostActivityItem"][];
}
defineProps<Props>();

defineOptions({
  name: "PostActivityList",
});
</script>
