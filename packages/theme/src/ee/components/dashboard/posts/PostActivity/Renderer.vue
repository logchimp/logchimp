<template>
  <AddComment
    :post-id="post.postId"
    :allow-internal="true"
    @add-comment="addCommentHandler"
  />

  <div class="mt-6">
    <dashboard-post-comment-list :post-id="post.postId" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { IDashboardPost, IPostActivity } from "@logchimp/types";

import { usePostActivityEEStore } from "../../../../store/postActivity";
import DashboardPostCommentList from "./CommentList.vue";
const AddComment = defineAsyncComponent(
  () => import("../../../../components/activity/AddComment.vue"),
);

const postActivityEEStore = usePostActivityEEStore();

interface Props {
  post: IDashboardPost;
}
const props = defineProps<Props>();

function addCommentHandler(activity: IPostActivity) {
  postActivityEEStore.addPostActivity(props.post.postId, activity);
}

defineOptions({
  name: "DashboardPostActivityRenderer",
});
</script>