<template>
	<client-error v-if="error">
		<p>Something went wrong!</p>
	</client-error>
	<div v-else class="roadmap">
		<roadmap-column
			v-for="roadmap in roadmaps"
			:key="roadmap.id"
			class="roadmap-view"
			:roadmap="roadmap"
		/>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// components
import RoadmapColumn from "../components/roadmap/RoadmapColumn.vue";
import ClientError from "../components/ui/ClientError.vue";

export default {
	name: "RoadmapPage",
	layout: "viewer",
	components: {
		// components
		RoadmapColumn,
		ClientError
	},
	data() {
		return {
			roadmaps: [],
			error: false,
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		})
	},
	created() {
		this.getRoadmaps();
	},
	methods: {
		async getRoadmaps() {
			try {
				const response = await this.$axios.$get("/api/v1/roadmaps");
				this.roadmaps = response.roadmaps;
			} catch (err) {
				console.error(err);
				this.error = true;
			}
		}
	},
	head() {
		return {
			title: `Roadmaps • ${this.settings.title}`,
			meta: [
				{
					name: "og:title",
					content: `Roadmaps • ${this.settings.title}`
				}
			]
		};
	}
};
</script>

<style lang='sass'>
.roadmap
	display: grid
	grid-auto-flow: column
	grid-auto-columns: minmax(22rem, 24rem)
	grid-column-gap: 1rem
	overflow-x: scroll
</style>
