<template>
  <div class="grid gap-y-5">
    <activity-item
      v-for="item in data"
      :key="item.id"
      :activity="item"
    />
  </div>

  <infinite-scroll :on-infinite="fetchPostActivity" :state="state" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import ActivityItem from "../../../../components/activity/ActivityItem.vue";
import { postActivity } from "../../../../modules/posts";
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../../../components/ui/InfiniteScroll.vue";
import { usePostActivityEEStore } from "../../../../store/postActivity";

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
      visibility: ["public", "internal"],
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

defineOptions({
  name: "DashboardPostCommentList",
});
</script>
