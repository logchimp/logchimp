<script setup lang="ts">
import { computed, ref } from "vue";
import type { IPostActivity } from "@logchimp/types";

import { addComment, postActivity } from "../../../modules/posts.ts";
import AddComment from "../../activity/AddComment.vue";
import PostActivityList from "../PostActivityList.vue";
import { usePostActivityEEStore } from "../../../store/postActivity.ts";
import InfiniteScroll, { type InfiniteScrollStateType } from "../../../../components/ui/InfiniteScroll.vue";

const postActivityEEStore = usePostActivityEEStore();

interface Props {
  postId: string;
}
const props = defineProps<Props>();

const page = ref<number>(1);
const state = ref<InfiniteScrollStateType>();
const data = computed(() => postActivityEEStore.activity[props.postId] || []);

async function fetchPostActivity() {
  try {
    const response = await postActivity(props.postId, {
      page: page.value.toString(),
    });

    if (response.data.activity.length) {
      postActivityEEStore.loadPostActivity(
        props.postId,
        response.data.activity,
      );
      page.value += 1;
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (error) {
    console.log(error);
    state.value = "ERROR";
  }
}

function addCommentHandler(activity: IPostActivity) {
  postActivityEEStore.addPostActivity(props.postId, activity);
}

defineOptions({
  name: "PostActivityRenderer",
});
</script>

<template>
  <add-comment @add-comment="addCommentHandler" :post-id="postId" />

  <div class="mt-8">
    <div class="flex items-center mb-5">
      <div class="font-semibold uppercase text-sm">
        Activity
      </div>

<!--      <div class="flex items-center ml-auto gap-x-3">-->
<!--      <div-->
<!--        class="cursor-pointer"-->
<!--        :class="{-->
<!--          'underline': activity.sort === 'desc'-->
<!--        }"-->
<!--        @click="activity.sort = 'desc'"-->
<!--      >-->
<!--        Newest-->
<!--      </div>-->
<!--      <div-->
<!--        class="cursor-pointer"-->
<!--        :class="{-->
<!--          'underline': activity.sort === 'asc'-->
<!--        }"-->
<!--        @click="activity.sort = 'asc'"-->
<!--      >-->
<!--        Oldest-->
<!--      </div>-->
<!--    </div>-->
    </div>

    <post-activity-list
      :post-id="postId"
      :data="data"
    />
    <infinite-scroll :on-infinite="fetchPostActivity" :state="state" />
  </div>
</template>