<template>
  <div class="homepage">
    <main class="homepage-posts">
			<div v-infinite-scroll="getBoardPosts">
				<post-item
					v-for="post in posts"
					:key="post.postId"
					:post="post"
				/>
        <!-- <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
				<client-error slot="error">
					<p>Something went wrong!</p>
				</client-error> -->
      </div>
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
import { vInfiniteScroll } from "@vueuse/components";

// modules
import { isSiteSetup } from "../modules/site";
import { getPosts } from "../modules/posts";
import { useSettingStore } from "../store/settings"
import { useUserStore } from "../store/user"

// components
import PostItem from "../components/post/PostItem.vue";
// import ClientError from "../components/ui/ClientError.vue";
// import Loader from "../components/ui/Loader.vue";
import SiteSetupCard from "../components/site/SiteSetupCard.vue";
import LoginCard from "../components/auth/LoginCard.vue";

const settingsStore = useSettingStore()
const userStore = useUserStore()

// TODO: Add TS type
const posts = ref<any>([]);
const page = ref(1);
const showSiteSetupCard = ref<boolean>(false)

async function isSetup() {
	try {
		const response = await isSiteSetup();
		showSiteSetupCard.value = !response.data.is_setup;
	} catch (error) {
		console.error(error);
	}
}

async function getBoardPosts() {
  try {
    const response = await getPosts({
			page: page.value,
			sort: "DESC"
		});

    if (response.data.posts.length) {
      posts.value.push(...response.data.posts);
      page.value += 1;
      // $state.loaded();
    } else {
      // $state.complete();
    }
  } catch (error) {
    console.error(error);
    // $state.error();
  }
}

onMounted(() => {
	isSetup()
	getBoardPosts()
});

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
