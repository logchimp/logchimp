<template>
  <DashboardPageHeader :mb="false">
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/posts">
          Posts
        </BreadcrumbItem>

        <!-- Show divider & title once data loaded -->
        <template v-if="post.title">
          <BreadcrumbDivider />
          <BreadcrumbItem>
            {{ post.title }}
          </BreadcrumbItem>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="loading"
      :disabled="hasPermission"
      @click="updatePostHandler"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div
    :class="[
      'grid gap-x-6',
      labs.voteOnBehalf ? 'grid-cols-[1fr_300px]' : 'grid-cols-1',
    ]"
  >
    <div class="pt-6 px-3 lg:px-6">
      <DashboardPostEditor
        ref="dashboardPostEditorRef"
        :post="post"
        @loading="loading = $event"
      />

      <div class="mt-10">
        <h6 class="form-section-title">
          Comments
        </h6>
        <dashboard-post-activity-renderer
          v-if="settingsEEStore.license.hierarchy >= 1"
          :post="post"
        />
        <div v-else class="text-sm">
          Please upgrade to <a href="/dashboard/settings/billing">higher plan</a> to view comments.
        </div>
      </div>
    </div>

    <PostSidebar v-if="labs.voteOnBehalf" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from "vue";
import type { IDashboardPost } from "@logchimp/types";

import DashboardPostEditor from "./PostEditor/index.vue";
import Button from "../../ui/Button.vue";
import Breadcrumbs from "../../Breadcrumbs.vue";
import BreadcrumbDivider from "../../ui/breadcrumbs/BreadcrumbDivider.vue";
import BreadcrumbItem from "../../ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../PageHeader.vue";
import { useUserStore } from "../../../store/user";
import { useSettingsEEStore } from "../../../ee/store/settings";
import { useSettingStore } from "../../../store/settings";
const PostSidebar = defineAsyncComponent(
  () => import("./PostSidebar/PostSidebar.vue"),
);
const DashboardPostActivityRenderer = defineAsyncComponent(
  () =>
    import("../../../ee/components/dashboard/posts/PostActivity/Renderer.vue"),
);

const settingsEEStore = useSettingsEEStore();
const { labs } = useSettingStore();
const { permissions } = useUserStore();

interface Props {
  post: IDashboardPost;
}
defineProps<Props>();

const loading = ref(false);
const dashboardPostEditorRef = ref();

const hasPermission = computed(() => {
  const checkPermission = permissions.includes("post:update");
  return !checkPermission;
});

function updatePostHandler() {
  dashboardPostEditorRef.value.updatePostHandler();
}

onMounted(() => {
  settingsEEStore.getLicenseInfo();
});

defineOptions({
  name: "DashboardPostViewer",
});
</script>
