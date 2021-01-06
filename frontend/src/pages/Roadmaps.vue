<template>
	<div class="roadmap">
		<roadmap-view
			v-for="roadmap in roadmaps"
			:key="roadmap.id"
			class="roadmap-view"
			:roadmap="roadmap"
		/>
	</div>
</template>

<script>
// modules
import { getAllRoadmaps } from "../modules/roadmaps";

// components
import RoadmapView from "../components/RoadmapView";

export default {
	name: "Roadmaps",
	data() {
		return {
			roadmaps: []
		};
	},
	components: {
		RoadmapView
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		async getRoadmaps() {
			try {
				const response = await getAllRoadmaps();
				this.roadmaps = response.data.roadmaps;
			} catch (err) {
				console.error(err);
			}
		}
	},
	created() {
		this.getRoadmaps();
	},
	metaInfo() {
		return {
			title: "Roadmaps",
			meta: [
				{
					name: "og:title",
					content: `Roadmaps · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
