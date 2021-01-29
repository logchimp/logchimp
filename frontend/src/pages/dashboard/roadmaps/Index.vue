<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">
					Roadmaps
				</h5>
			</div>

			<Button
				type="primary"
				:disabled="createRoadmapButtonDisabled"
				:loading="createRoadmapButtonLoading"
				@click="createRoadmap"
			>
				Create roadmap
			</Button>
		</header>

		<div class="table-container">
			<div class="table-header">
				<div class="table-header-item" />
				<div class="table-header-item">
					name
				</div>
				<div class="table-header-item" />
			</div>
			<div class="table-body">
				<draggable
					v-model="roadmaps"
					group="roadmap"
					handle=".grip-handler"
					:move="moveItem"
					@start="drag = true"
					@end="initialiseSort"
				>
					<div
						v-for="roadmap in roadmaps"
						:key="roadmap.id"
						class="table-row"
					>
						<div class="grip-handler table-data table-data-icon">
							<grip-icon />
						</div>
						<div class="table-data">
							{{ roadmap.name }}
						</div>
						<div class="table-icon-group boards-table-icons">
							<div class="table-data table-data-icon">
								<eye-icon v-if="roadmap.display" />
								<eye-off-icon v-else />
							</div>
							<router-link
								:to="`/dashboard/roadmaps/${roadmap.url}/settings`"
								class="table-data table-data-icon"
							>
								<settings-icon />
							</router-link>
						</div>
					</div>
				</draggable>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import {
	GripVertical as GripIcon,
	Eye as EyeIcon,
	EyeOff as EyeOffIcon,
	Settings as SettingsIcon
} from "lucide-vue";
import draggable from "vuedraggable";

// modules
import {
	getAllRoadmaps,
	createRoadmap,
	sortRoadmap
} from "../../../modules/roadmaps";

// components
import Button from "../../../components/Button";

export default {
	name: "Roadmaps",
	components: {
		draggable,
		Button,

		// icons
		GripIcon,
		EyeIcon,
		EyeOffIcon,
		SettingsIcon
	},
	data() {
		return {
			roadmaps: [],
			createRoadmapButtonLoading: false,
			sort: {}
		};
	},
	computed: {
		createRoadmapButtonDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("roadmap:create");
			return !checkPermission;
		}
	},
	created() {
		this.getRoadmaps();
	},
	methods: {
		async createRoadmap() {
			try {
				const response = await createRoadmap();

				const url = response.data.roadmap.url;
				this.$router.push(`/dashboard/roadmap/${url}/settings`);
			} catch (err) {
				console.error(err);
			}
		},
		moveItem(event) {
			// current
			this.sort.to = {
				id: event.draggedContext.element.id,
				index: event.draggedContext.futureIndex + 1
			};

			// replaced with
			this.sort.from = {
				id: event.relatedContext.element.id,
				index: event.draggedContext.index + 1
			};
		},
		async initialiseSort() {
			try {
				const response = await sortRoadmap(this.sort);

				if (response.status == 200) {
					this.getRoadmaps();
				}
			} catch (err) {
				console.error(err);
			} finally {
				this.drag = false;
			}
		},
		async getRoadmaps() {
			try {
				const response = await getAllRoadmaps();
				this.roadmaps = response.data.roadmaps;
			} catch (err) {
				console.error(err);
			}
		}
	},
	metaInfo() {
		return {
			title: `Roadmaps · Dashboard`
		};
	}
};
</script>
