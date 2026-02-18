<template>
  <div class="flex flex-col-reverse lg:flex-row mb-16 lg:gap-x-8">
    <main class="grow-[2] shrink basis-0">
      <post-item
        v-for="post in posts"
        :key="post.postId"
        :post="post"
      />

      <infinite-scroll :on-infinite="loadMorePosts" :state="state" />
    </main>
    <aside class="flex-1 h-full mb-6 lg:mb-0 grid grid-cols-1 gap-y-4 lg:sticky lg:top-20">
      <site-setup-card v-if="showSiteSetupCard" />
      <create-post v-else />
      <top-public-boards-list />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from "vue";
import { useHead } from "@vueuse/head";
import type { IPost } from "@logchimp/types";

// modules
import { isSiteSetup } from "../modules/site";
import { getPosts } from "../modules/posts";
import { useSettingStore } from "../store/settings";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../components/ui/InfiniteScroll.vue";
import PostItem from "../components/post/PostItem.vue";
import SiteSetupCard from "../components/site/SiteSetupCard.vue";
import TopPublicBoardsList from "../ee/components/TopPublicBoardsList.vue";
const CreatePost = defineAsyncComponent(
  () => import("../components/post/CreatePost.vue"),
);

const settingsStore = useSettingStore();

const posts = ref<IPost[]>([]);
const page = ref<number>(1);
const showSiteSetupCard = ref<boolean>(false);
const state = ref<InfiniteScrollStateType>();

async function isSetup() {
  try {
    const response = await isSiteSetup();
    showSiteSetupCard.value = !response.data.is_setup;
  } catch (error) {
    console.error(error);
  }
}

async function loadMorePosts() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;

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

onMounted(() => isSetup());

useHead({
  title: "Home",
  meta: [
    {
      name: "og:title",
      content: () => `Home • ${settingsStore.get.title}`,
    },
  ],
});

defineOptions({
  name: "Homepage",
});
</script>
