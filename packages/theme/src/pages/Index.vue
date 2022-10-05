<template>
  <div class="homepage">
    <main class="homepage-posts">
			<div v-infinite-scroll="getBoardPosts">
				<post
					v-for="post in posts"
					:key="post.postId"
					:post="post"
				/>
        <!-- <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
        <div slot="error" /> -->
      </div>
    </main>
    <aside class="homepage-sidebar">
      <site-setup-card v-if="showSiteSetupCard" />
      <login-card v-if="!getUserId && !showSiteSetupCard" />
    </aside>
  </div>
</template>

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
import Post from "../components/post/Post.vue";
// import Loader from "../components/Loader.vue";
import SiteSetupCard from "../components/SiteSetupCard.vue";
import LoginCard from "../components/LoginCard.vue";

const { get: siteSettings } = useSettingStore()
const { getUserId } = useUserStore()

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
			content: `Home · ${siteSettings.title}`
		}
	]
})
</script>
