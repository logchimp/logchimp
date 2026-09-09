<template>
  <DashboardPageHeader class="md:hidden" />

  <div class="flex items-start gap-x-4 px-3 lg:px-6 py-6">
    <div class="flex-2">
      <div class="text-neutral-500 font-medium mb-2 text-sm ml-1.5">Posts</div>
      <recently-created-posts />
    </div>

    <div class="flex-1">
      <div class="text-neutral-500 font-medium mb-2 text-sm ml-1.5">Boards</div>
      <recently-created-boards />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted } from "vue";
import { useHead } from "@vueuse/head";
import { useRoute, useRouter } from "vue-router";

import { useSettingStore } from "../../store/settings";
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";

const RecentlyCreatedPosts = defineAsyncComponent(
  () => import("../../components/dashboard/index/RecentlyCreatedPosts.vue"),
);
const RecentlyCreatedBoards = defineAsyncComponent(
  () => import("../../ee/components/dashboard/index/RecentlyCreatedBoards.vue"),
);

const route = useRoute();
const routerInstance = useRouter();
const settingsStore = useSettingStore();

onMounted(() => {
  if (route.query.onboarding === "complete") {
    // Remove the query param so confetti only shows once
    const { onboarding, ...restQuery } = route.query;
    routerInstance.replace({ query: restQuery });

    settingsStore.getSiteSettings();

    import("canvas-confetti")
      .then((confetti) => {
        // Fire confetti burst
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

useHead({
  title: "Dashboard",
});

defineOptions({
  name: "DashboardOverview",
});
</script>
