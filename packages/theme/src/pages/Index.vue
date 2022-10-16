<template>
  <div class="homepage">
    <main class="homepage-posts">
      <post-item
        v-for="post in posts"
        :key="post.postId"
        :post="post"
      />

      <infinite-scroll @infinite="getBoardPosts" :state="state" />
    </main>
    <aside class="homepage-sidebar">
      <site-setup-card v-if="showSiteSetupCard" />
      <login-card v-if="!userStore.getUserId && !showSiteSetupCard" />
    </aside>
  </div>
</template>

<script lang="ts">
export default {
	name: "Homepage"
}
</script>

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { isSiteSetup } from "../modules/site";
import { getPosts } from "../modules/posts";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// components
import InfiniteScroll, { InfiniteScrollStateType } from "../components/ui/InfiniteScroll.vue";
import PostItem from "../components/post/PostItem.vue";
import SiteSetupCard from "../components/site/SiteSetupCard.vue";
import LoginCard from "../components/auth/LoginCard.vue";

const settingsStore = useSettingStore()
const userStore = useUserStore()

// TODO: Add TS type
const posts = ref<any>([]);
const page = ref<number>(1);
const showSiteSetupCard = ref<boolean>(false)
const state = ref<InfiniteScrollStateType>()

async function isSetup() {
	try {
		const response = await isSiteSetup();
		showSiteSetupCard.value = !response.data.is_setup;
	} catch (error) {
		console.error(error);
	}
}

async function getBoardPosts() {
  state.value = 'LOADING'

  try {
    const response = await getPosts({
			page: page.value,
			sort: "DESC"
		});

    if (response.data.posts.length) {
      posts.value.push(...response.data.posts);
      page.value += 1;
      state.value = 'LOADED'
    } else {
      state.value = 'COMPLETED'
    }
  } catch (error) {
    console.error(error);
    state.value = 'ERROR'
  }
}

onMounted(() => isSetup());

useHead({
	title: "Home",
	meta: [
		{
			name: "og:title",
			content: `Home • ${settingsStore.get.title}`
		}
	]
})
</script>

<style lang='sass'>
.homepage
	display: flex
	margin-bottom: 4rem

@media (max-width: 990px)
	.homepage
		flex-direction: column-reverse

	.homepage-sidebar
		margin-bottom: 1.5rem

@media (min-width: 992px)
	.homepage-posts
		flex: 2
		margin-right: 2rem

	.homepage-sidebar
		flex: 1
		margin-left: 2rem
</style>
