<template>
  <DashboardPostEditor
    :post="post"
  />
</template>

<script setup lang="ts">
import type { IDashboardPost } from "@logchimp/types";
import DashboardPostEditor from "./PostEditor/index.vue";

interface Props {
  post: IDashboardPost;
}
defineProps<Props>();

defineOptions({
  name: "DashboardPostViewer",
});
</script>
