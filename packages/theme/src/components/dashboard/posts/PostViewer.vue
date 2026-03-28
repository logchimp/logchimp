<template>
  <DashboardPageHeader>
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

  <div class="px-3 lg:px-6">
    <DashboardPostEditor
      ref="dashboardPostEditorRef"
      :post="post"
      @loading="loading = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { IDashboardPost } from "@logchimp/types";

import DashboardPostEditor from "./PostEditor/index.vue";
import Button from "../../ui/Button.vue";
import Breadcrumbs from "../../Breadcrumbs.vue";
import BreadcrumbDivider from "../../ui/breadcrumbs/BreadcrumbDivider.vue";
import BreadcrumbItem from "../../ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../PageHeader.vue";
import { useUserStore } from "../../../store/user";

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

defineOptions({
  name: "DashboardPostViewer",
});
</script>
