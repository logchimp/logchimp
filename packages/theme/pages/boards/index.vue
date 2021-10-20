<template>
	<div>
		<div v-if="boards.length > 0" class="boards-lists">
			<board-item
				v-for="board in boards"
				:key="board.boardId"
				:name="board.name"
				:color="board.color"
				:url="board.url"
				:post-count="Number(board.post_count)"
			/>
		</div>
		<client-only>
			<infinite-loading @infinite="getBoards">
				<div slot="spinner" class="loader-container">
					<loader />
				</div>
				<div slot="no-more" />
				<div slot="no-results" />
				<div slot="error" />
			</infinite-loading>
		</client-only>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

// components
import BoardItem from "../../components/board/BoardItem.vue";
import Loader from "../../components/ui/Loader.vue";

export default {
	name: "Boards",
	layout: "viewer",
	components: {
		// packages
		InfiniteLoading,

		// components
		BoardItem,
		Loader
	},
	data() {
		return {
			boards: [],
			page: 1
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	methods: {
		async getBoards($state) {
			try {
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/boards",
					params: {
						page: this.page,
						limit: null,
						created: "desc"
					}
				});

				if (response.data.boards.length) {
					this.boards.push(...response.data.boards);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				console.error(error);
				$state.error();
			}
		}
	},
	head() {
		return {
			title: `Boards • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Boards • ${this.settings.title}`
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.boards-lists
	display: grid
	grid-template-columns: 1fr
	grid-column-gap: 1rem
	grid-row-gap: 1rem
	justify-content: space-between
	margin-bottom: 4rem

@media (min-width: 768px)
	.boards-lists
		grid-template-columns: repeat(auto-fill, 48%)
		grid-row-gap: 1.5rem

@media (min-width: 992px)
	.boards-lists
		grid-template-columns: repeat(auto-fill, 30%)

@media (min-width: 1200px)
	.boards-lists
		grid-template-columns: repeat(auto-fill, 23%)
</style>
