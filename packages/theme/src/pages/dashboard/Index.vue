<template>
  <div class="dashboard-overview-posts-and-boards">
    <div class="dashboard-overview-posts">
      <div class="table-heading">
        Posts
      </div>
      <Table>
        <template #header>
          <div class="table-header-item posts-table-title">
            title
          </div>
          <div class="table-header-item posts-table-votes">
            votes
          </div>
        </template>
				<div v-infinite-scroll="getPosts">
					<router-link
						v-for="post in posts.data"
						:key="post.postId"
						:to="`/dashboard/posts/${post.slug}`"
						class="table-row"
					>
						<div class="table-data posts-table-title">
							{{ post.title }}
						</div>
						<div class="table-data posts-table-votes">
							{{ post.voters.votesCount }}
						</div>
					</router-link>
          <!-- <div slot="spinner" class="loader-container">
            <loader />
          </div>
          <div slot="no-more" />
          <div slot="no-results" />
          <div slot="error" /> -->
        </div>
      </Table>
    </div>
    <div class="dashboard-overview-boards">
      <div class="table-heading">
        Boards
      </div>
      <Table>
        <template #header>
          <div class="table-header-item boards-table-color" />
          <div class="table-header-item boards-table-name">
            name
          </div>
          <div class="table-header-item boards-table-posts">
            posts
          </div>
        </template>
        <div v-infinite-scroll="getBoards">
					<div
						v-for="board in boards.data"
						:key="board.boardId"
						class="table-row"
					>
						<div class="table-data boards-table-color">
							<div
								class="color-dot"
								:style="{
									backgroundColor: `#${board.color}`
								}"
							/>
						</div>
						<div class="table-data boards-table-name">
							{{ board.name }}
						</div>
						<div class="table-data boards-table-posts">
							{{ board.post_count }}
						</div>
					</div>
          <!-- <div slot="spinner" class="loader-container">
            <loader />
          </div>
          <div slot="no-more" />
          <div slot="no-results" />
          <div slot="error" /> -->
        </div>
      </Table>
    </div>
  </div>
</template>

<script lang="ts">
export default {
	name: "DashboardOverview",
}
</script>

<script setup lang="ts">
// packages
import { onMounted, reactive } from "vue";
import { useHead } from "@vueuse/head";
import { vInfiniteScroll } from "@vueuse/components";

// modules
import { getPosts } from "../../modules/posts";
import { getAllBoards } from "../../modules/boards";

// components
import Table from "../../components/Table.vue";
// import Loader from "../../components/Loader.vue";

const posts = reactive<{
	// TODO: Add TS types
	data: any
	loading: boolean
}>({
	data: [],
	loading: false
})
const boards = reactive<{
	// TODO: Add TS types
	data: any
	loading: boolean
}>({
	data: [],
	loading: false
})

async function getRecentPosts() {
	try {
		const response = await getPosts({
			page: 1,
			limit: 4,
			sort: "DESC"
		});

		posts.data = response.data.posts;
		// $state.complete();
	} catch (error) {
		console.error(error);
		// $state.error();
	}
}

async function getBoards() {
	try {
		const response = await getAllBoards({
			page: 1,
			limit: 4,
			sort: "DESC"
		});

		boards.data = response.data.boards;
		// $state.complete();
	} catch (error) {
		console.error(error);
		// $state.error();
	}
}

onMounted(() => {
	getRecentPosts()
	getBoards()
})

useHead({
	title: "Dashboard"
})
</script>
