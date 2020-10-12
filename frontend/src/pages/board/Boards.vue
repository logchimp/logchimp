<template>
	<div>
		<div v-if="boards.length > 0" class="boards-lists">
			<router-link
				:to="`/board/${board.url}`"
				v-for="board in boards"
				:key="board.boardId"
				class="boards-item"
			>
				<div
					class="board-color boards-item-color"
					:style="{
						backgroundColor: `#${board.color}`
					}"
				/>
				<div class="boards-item-name-and-posts">
					<div class="boards-item-name">
						{{ board.name }}
					</div>
					<div class="boards-item-posts">
						{{ board.posts }}
					</div>
				</div>
			</router-link>
		</div>
		<infinite-loading @infinite="getBoards">
			<div class="loader-container" slot="spinner"><loader /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
			<div slot="error"></div>
		</infinite-loading>
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Loader from "../../components/Loader";

export default {
	name: "Boards",
	data() {
		return {
			boards: [],
			page: 1
		};
	},
	components: {
		// packages
		InfiniteLoading,

		// components
		Loader
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		getBoards($state) {
			axios({
				method: "get",
				url: "/api/v1/boards",
				params: {
					page: this.page,
					created: "desc"
				}
			})
				.then(response => {
					if (response.data.boards.length) {
						this.boards.push(...response.data.boards);
						this.page += 1;
						$state.loaded();
					} else {
						$state.complete();
					}
				})
				.catch(error => {
					console.error(error);
					$state.error();
				});
		}
	},
	metaInfo() {
		return {
			title: "Boards",
			meta: [
				{
					name: "og:title",
					content: `Boards · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
