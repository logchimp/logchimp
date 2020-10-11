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
			<div class="loader-container loader" slot="spinner"><loader-icon /></div>
			<div slot="no-more"></div>
			<div slot="no-results"></div>
			<div slot="error"></div>
		</infinite-loading>
	</div>
</template>

<script>
// icon
import LoaderIcon from "@/components/icons/Loader";

export default {
	data() {
		return {
			boards: [],
			page: 1
		};
	},
	components: {
		LoaderIcon
	},
	// computed: {
	// 	getSiteSittings() {
	// 		return this.$store.getters["settings/get"];
	// 	}
	// },
	methods: {
		async getBoards($state) {
			try {
				const response = await this.$axios.$get("/api/v1/boards", {
					params: {
						page: this.page,
						created: "desc"
					}
				});
				if (response.boards.length) {
					this.boards.push(...response.boards);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				console.log(error);
				$state.error();
			}
		}
	}
	// metaInfo() {
	// 	return {
	// 		title: "Boards",
	// 		meta: [
	// 			{
	// 				name: "og:title",
	// 				content: `Boards · ${this.getSiteSittings.title}`
	// 			}
	// 		]
	// 	};
	// }
};
</script>
