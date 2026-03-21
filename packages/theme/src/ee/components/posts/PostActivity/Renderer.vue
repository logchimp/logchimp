<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from "vue";
import type { IPostActivity } from "@logchimp/types";

import { postActivity } from "../../../modules/posts";
import { usePostActivityEEStore } from "../../../store/postActivity";
import { useUserStore } from "../../../../store/user";
import PostActivityList from "./List.vue";
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../../components/ui/InfiniteScroll.vue";

const AddComment = defineAsyncComponent(
  () => import("../../activity/AddComment.vue"),
);
const SigninToComment = defineAsyncComponent(
  () => import("./SigninToComment.vue"),
);

const { getUserId } = useUserStore();
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
      visibility: "public",
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
  <add-comment
    v-if="getUserId"
    @add-comment="addCommentHandler"
    :post-id="postId"
  />
  <signin-to-comment v-else />

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

    <post-activity-list :data="data" />
    <infinite-scroll :on-infinite="fetchPostActivity" :state="state" />
  </div>
</template>