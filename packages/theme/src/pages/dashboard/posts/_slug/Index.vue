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
    <DashboardPostEditor
      v-else-if="post.postId && !errorCode"
      :post="post"
    />
    <Dashboard404 v-else-if="errorCode === 'POST_NOT_FOUND'">
      Post not found
    </Dashboard404>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IDashboardPost } from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { getPostBySlug } from "../../../../modules/posts";

// components
import Dashboard404 from "../../../../components/dashboard/404.vue";
import DashboardPostEditor from "../../../../components/dashboard/posts/PostEditor/index.vue";
import LoaderContainer from "../../../../components/ui/LoaderContainer.vue";

const errorCode = ref<string | undefined>();
const loading = ref<boolean>(false);
const post = reactive<IDashboardPost>({
  postId: "",
  title: "",
  slug: "",
  slugId: "",
  contentMarkdown: "",
  // TODO: what should be the default/empty value
  updatedAt: new Date(),
  // TODO: what should be the default/empty value
  createdAt: new Date(),
  author: {
    userId: "",
    name: "",
    username: "",
    avatar: "",
  },
  board: {
    boardId: "",
    name: "",
    url: "",
    color: "",
    createdAt: new Date(),
  },
  roadmap: {
    id: "",
    name: "",
    url: "",
    color: "",
  },
  voters: {
    votes: [],
    votesCount: 0,
    viewerVote: undefined,
  },
});

async function postBySlug() {
  loading.value = true;
  errorCode.value = undefined;

  const route = router.currentRoute.value;
  if (route.params.slug) {
    try {
      const slug = route.params.slug.toString();
      const response = await getPostBySlug(slug);

      Object.assign(post, response.data.post);
      loading.value = false;
    } catch (err) {
      console.error(err);
      // @ts-expect-error
      errorCode.value = err.response.data.code;
      loading.value = false;
    }
  }
}

onMounted(() => postBySlug());

useHead({
  title: () => `${post.title ? `${post.title} • ` : ""}Post • Dashboard`,
});

defineOptions({
  name: "DashboardPostView",
});
</script>
