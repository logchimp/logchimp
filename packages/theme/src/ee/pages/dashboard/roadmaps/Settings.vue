<template>
  <div
    :class="[
      'flex-1',
      {
        'flex items-center': loading || errorCode
      }
    ]"
  >
    <LoaderContainer v-if="loading" />
    <RoadmapEditor
      v-else-if="roadmap.id && !errorCode"
      :title="title"
      :roadmap="roadmap"
    />
    <Dashboard404 v-else-if="errorCode === 'ROADMAP_NOT_FOUND'">
      Roadmap not found
    </Dashboard404>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IUpdateRoadmapRequestBody } from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { getRoadmapByUrl } from "../../../../modules/roadmaps";

// components
import Dashboard404 from "../../../../components/dashboard/404.vue";
import LoaderContainer from "../../../../components/ui/LoaderContainer.vue";
import RoadmapEditor from "../../../components/roadmap/RoadmapEditor.vue";

const errorCode = ref<string | undefined>();
const loading = ref<boolean>(false);
const title = ref<string>("");
const roadmap = reactive<IUpdateRoadmapRequestBody>({
  id: "",
  name: "",
  url: "",
  color: "",
  display: false,
});

async function getRoadmap(url: string) {
  loading.value = true;
  errorCode.value = undefined;

  try {
    const response = await getRoadmapByUrl(url);

    title.value = response.data.roadmap.name;
    Object.assign(roadmap, {
      id: response.data.roadmap.id,
      name: title.value,
      url: response.data.roadmap.url,
      color: response.data.roadmap.color,
      display: response.data.roadmap.display,
    });
  } catch (err) {
    console.error(err);
    // @ts-expect-error
    errorCode.value = err.response.data.code;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const route = router.currentRoute.value;
  const urlParam = (route.params.url || "").toString();
  if (urlParam) {
    getRoadmap(urlParam);
  } else {
    router.push("/dashboard/roadmaps");
  }
});

useHead({
  title: () =>
    `${roadmap?.name ? `${roadmap.name} • ` : ""}Roadmap • Dashboard`,
});

defineOptions({
  name: "DashboardRoadmapSettings",
});
</script>
