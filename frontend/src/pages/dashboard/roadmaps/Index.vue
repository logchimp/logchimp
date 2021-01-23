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
					@end="dragEnd"
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
								:to="`/dashboard/roadmap/${roadmap.url}/settings`"
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
import draggable from "vuedraggable";

// modules
import { getAllRoadmaps, createRoadmap } from "../../../modules/roadmaps";

// components
import Button from "../../../components/Button";

// icons
import GripIcon from "../../../components/icons/Grip";
import EyeIcon from "../../../components/icons/Eye";
import EyeOffIcon from "../../../components/icons/EyeOff";
import SettingsIcon from "../../../components/icons/Settings";

export default {
	name: "Roadmaps",
	components: {
		draggable,
		Button,
		GripIcon,
		EyeIcon,
		EyeOffIcon,
		SettingsIcon
	},
	data() {
		return {
			roadmaps: [],
			createRoadmapButtonLoading: false
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
				this.$router.push(`/dashboard/roadmaps/${url}/settings`);
			} catch (err) {
				console.error(err);
			}
		},
		async dragEnd() {
			console.log("Drag end");
			this.drag = false;
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
