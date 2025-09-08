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
      v-for="post in dashboardPosts.posts"
      :key="post.postId"
      :post="post"
      :dashboard="true"
    />

    <infinite-scroll
      :on-infinite="dashboardPosts.fetchPosts"
      :state="dashboardPosts.state"
    />
	</div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";

import { useDashboardPosts } from "../../../store/dashboard/posts";

// components
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import InfiniteScroll from "../../../components/ui/InfiniteScroll.vue";
import PostItem from "../../../components/post/PostItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";

const dashboardPosts = useDashboardPosts();

useHead({
  title: "Posts • Dashboard",
});

defineOptions({
  name: "DashboardPosts",
});
</script>
