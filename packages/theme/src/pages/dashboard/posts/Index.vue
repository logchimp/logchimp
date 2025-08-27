<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Posts</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

	<div class="px-3 lg:px-6">
    <post-item
      v-for="post in posts"
      :key="post.postId"
      :post="post"
      :dashboard="true"
    />

    <infinite-scroll @infinite="getBoardPosts" :state="state" />
	</div>
</template>

<script setup lang="ts">
// packages
import { ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IPost } from "@logchimp/types";

// modules
import { getPosts } from "../../../modules/posts";

// components
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../components/ui/InfiniteScroll.vue";
import PostItem from "../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";

const posts = ref<IPost[]>([]);
const page = ref<number>(1);

const state = ref<InfiniteScrollStateType>();

async function getBoardPosts() {
  state.value = "LOADING";

  try {
    const response = await getPosts({
      page: page.value.toString(),
      created: "DESC",
      boardId: [],
    });

    if (response.data.posts.length) {
      posts.value.push(...response.data.posts);
      page.value += 1;
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (error) {
    console.error(error);
    state.value = "ERROR";
  }
}

useHead({
  title: "Posts • Dashboard",
});

defineOptions({
  name: "DashboardPosts",
});
</script>
