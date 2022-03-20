<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">Roadmaps</h5>
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
				<div class="table-header-item">name</div>
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
						v-for="(roadmap, index) in roadmaps"
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
							<dropdown-wrapper>
								<template #toggle>
									<div
										class="
											table-data table-data-icon
											boards-table-icon-settings
											dropdown-menu-icon
										"
									>
										<more-icon />
									</div>
								</template>
								<template #default="dropdown">
									<dropdown v-if="dropdown.active">
										<dropdown-item
											@click="
												$router.push(
													`/dashboard/roadmaps/${roadmap.url}/settings`
												)
											"
										>
											<template #icon>
												<settings-icon />
											</template>
											Settings
										</dropdown-item>
										<dropdown-item
											v-if="isDeveloperMode"
											@click="copyText(roadmap.id)"
										>
											<template #icon>
												<copy-icon />
											</template>
											Copy ID
										</dropdown-item>
										<dropdown-spacer />
										<dropdown-item
											:disabled="deleteRoadmapPermissionDisabled"
											class="color-danger"
											@click="deleteRoadmap(roadmap.id, index)"
										>
											<template #icon>
												<delete-icon />
											</template>
											Delete
										</dropdown-item>
									</dropdown>
								</template>
							</dropdown-wrapper>
						</div>
					</div>
				</draggable>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import {
	GripVertical as GripIcon,
	Eye as EyeIcon,
	EyeOff as EyeOffIcon,
	MoreHorizontal as MoreIcon,
	Clipboard as CopyIcon,
	Trash2 as DeleteIcon,
	Settings as SettingsIcon
} from "lucide-vue";
import draggable from "vuedraggable";

// components
import Button from "../../../components/ui/Button.vue";
import DropdownWrapper from "../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../../../components/ui/dropdown/DropdownSpacer.vue";

export default {
	name: "DashboardRoadmaps",
	layout: "dashboard",
	components: {
		draggable,
		Button,
		DropdownWrapper,
		Dropdown,
		DropdownItem,
		DropdownSpacer,

		// icons
		GripIcon,
		EyeIcon,
		EyeOffIcon,
		MoreIcon,
		CopyIcon,
		DeleteIcon,
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
		...mapGetters("settings", {
			settings: "get"
		}),
		createRoadmapButtonDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("roadmap:create");
			return !checkPermission;
		},
		deleteRoadmapPermissionDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("roadmap:destroy");
			return !checkPermission;
		},
		isDeveloperMode() {
			return this.$store.getters["settings/get"].developer_mode;
		}
	},
	created() {
		this.getRoadmaps();
	},
	methods: {
		async createRoadmap() {
			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/roadmaps",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const url = response.data.roadmap.url;
				this.$router.push(`/dashboard/roadmaps/${url}/settings`);
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
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "PATCH",
					url: "/api/v1/roadmaps/sort",
					data: this.sort,
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (response.status === 200) {
					this.drag = false;
				}
			} catch (err) {
				console.error(err);
				this.drag = false;
			}
		},
		async getRoadmaps() {
			try {
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/roadmaps"
				});

				this.roadmaps = response.data.roadmaps;
			} catch (err) {
				console.error(err);
			}
		},
		async deleteRoadmap(id, index) {
			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "DELETE",
					url: "/api/v1/roadmaps",
					data: {
						id
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (response.status === 204) {
					this.roadmaps.splice(index, 1);
					console.log(`[Dashboard] Delete roadmap (${id})`);
				}
			} catch (error) {
				console.error(error);
			}
		},
		copyText(text) {
			navigator.clipboard
				.writeText(text)
				.then()
				.catch((err) => console.log(err));
		}
	},
	head() {
		return {
			title: `Roadmaps • Dashboard • ${this.settings.title}`
		};
	}
};
</script>
