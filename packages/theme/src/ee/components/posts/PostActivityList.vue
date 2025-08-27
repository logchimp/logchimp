<template>
  <div v-if="showPostActivity" class="mt-8">
    <add-comment @add-comment="addComment" :post-id="postId" />

    <header class="mt-8 flex items-center mb-5">
      <div class="font-semibold uppercase text-sm">activity</div>

      <!-- <div class="flex items-center ml-auto gap-x-3">
          <div
            class="cursor-pointer"
            :class="{
              'underline': activity.sort === 'desc'
            }"
            @click="activity.sort = 'desc'"
          >
            Newest
          </div>
          <div
            class="cursor-pointer"
            :class="{
              'underline': activity.sort === 'asc'
            }"
            @click="activity.sort = 'asc'"
          >
            Oldest
          </div>
        </div> -->
    </header>

    <div v-if="!activity.loading" class="grid gap-y-5">
      <activity-item
        v-for="item in activity.data"
        :key="item.id"
        :activity="item"
      />
    </div>
    <div v-else class="loader-container">
      <loader />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import type { ApiSortType, IPostActivity } from "@logchimp/types";

import { addComment, postActivity } from "../../modules/posts";
import { useSettingStore } from "../../../store/settings";

// components
import Loader from "../../../components/ui/Loader.vue";
import AddComment from "../activity/AddComment.vue";
import ActivityItem from "../activity/ActivityItem.vue";

const { labs } = useSettingStore();

interface Props {
  postId: string;
}

const props = defineProps<Props>();

// activity
const activity = reactive<{
  loading: boolean;
  sort: ApiSortType;
  data: IPostActivity[];
}>({
  loading: false,
  sort: "DESC",
  data: [],
});

const showPostActivity = computed(() => {
  return labs.comments;
});

async function getPostActivity() {
  activity.loading = true;

  try {
    const response = await postActivity(props.postId, {
      page: "0",
    });

    activity.data = response.data.activity;
  } catch (error) {
    console.log(error);
  } finally {
    activity.loading = false;
  }
}

onMounted(() => getPostActivity());

// Get post activity on changing sort
// watch(
//   () => activity.sort,
//   (value) => {
//     getPostActivity(value);
//   },
// );
</script>

