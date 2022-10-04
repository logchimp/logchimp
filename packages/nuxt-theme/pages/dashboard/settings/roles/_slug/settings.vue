<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<a href="/dashboard/settings/roles" class="breadcrum-item">
					Roles
				</a>
				<div class="breadcrum-divider">/</div>
				<h5 class="breadcrum-item">
					{{ title }}
				</h5>
			</div>

			<Button
				type="primary"
				:loading="updateRoleButtonLoading"
				:disabled="updateRoleButtonDisabled"
				@click="updateRole"
			>
				Save
			</Button>
		</header>

		<div class="form-section">
			<div class="form-columns">
				<div class="form-column">
					<l-text v-model="role.name" label="Name" placeholder="Role name" />
				</div>

				<div class="form-column">
					<l-textarea
						v-model="role.description"
						label="Description"
						rows="4"
						name="Role description"
						placeholder="What's about this role?"
					/>
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Posts permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.post.read" label="Read" />
					<toggle-item
						v-model="permissions.post.update"
						label="Update"
						note="Allows users to edit post submitted by other users."
					/>
				</div>

				<div class="form-column">
					<toggle-item v-model="permissions.post.create" label="Create" />
					<toggle-item v-model="permissions.post.destroy" label="Delete" />
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Boards permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.board.read" label="Read" />
					<toggle-item v-model="permissions.board.update" label="Update" />
					<toggle-item v-model="permissions.board.assign" label="Assign" />
				</div>

				<div class="form-column">
					<toggle-item v-model="permissions.board.create" label="Create" />
					<toggle-item v-model="permissions.board.destroy" label="Delete" />
					<toggle-item v-model="permissions.board.unassign" label="Unassign" />
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Roadmaps permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.roadmap.read" label="Read" />
					<toggle-item v-model="permissions.roadmap.update" label="Update" />
					<toggle-item v-model="permissions.roadmap.assign" label="Assign" />
				</div>

				<div class="form-column">
					<toggle-item v-model="permissions.roadmap.create" label="Create" />
					<toggle-item v-model="permissions.roadmap.destroy" label="Delete" />
					<toggle-item
						v-model="permissions.roadmap.unassign"
						label="Unassign"
					/>
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Vote permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.vote.create" label="Create" />
					<toggle-item v-model="permissions.vote.destroy" label="Delete" />
				</div>

				<div class="form-column">
					<toggle-item v-model="permissions.vote.assign" label="Assign" />
					<toggle-item v-model="permissions.vote.unassign" label="Unassign" />
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Dashboard permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.dashboard.read" label="Read" />
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Roles permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.role.read" label="Read" />
					<toggle-item v-model="permissions.role.update" label="Update" />
					<toggle-item v-model="permissions.role.assign" label="Assign" />
				</div>

				<div class="form-column">
					<toggle-item v-model="permissions.role.create" label="Create" />
					<toggle-item v-model="permissions.role.destroy" label="Delete" />
					<toggle-item v-model="permissions.role.unassign" label="Unassign" />
				</div>
			</div>
		</div>

		<div class="form-section">
			<p class="form-section-title">Settings permissions</p>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item v-model="permissions.settings.read" label="Read" />
				</div>

				<div class="form-column">
					<toggle-item v-model="permissions.settings.update" label="Update" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// components
import Button from "../../../../../components/ui/Button.vue";
import LText from "../../../../../components/ui/LText.vue";
import LTextarea from "../../../../../components/ui/LTextarea.vue";
import ToggleItem from "../../../../../components/ui/ToggleItem.vue";

export default {
	name: "RoleSettings",
	layout: "dashboard",
	components: {
		Button,
		LText,
		LTextarea,
		ToggleItem
	},
	data() {
		return {
			title: "",
			role: {},
			permissions: {
				post: {
					create: false,
					read: false,
					update: false,
					destroy: false
				},
				board: {
					create: false,
					read: false,
					update: false,
					destroy: false,
					assign: false,
					unassign: false
				},
				roadmap: {
					create: false,
					read: false,
					update: false,
					destroy: false,
					assign: false,
					unassign: false
				},
				vote: {
					create: false,
					destroy: false,
					assign: false,
					unassign: false
				},
				dashboard: {
					read: false
				},
				role: {
					create: false,
					read: false,
					update: false,
					destroy: false,
					assign: false,
					unassign: false
				},
				settings: {
					read: false,
					update: false
				}
			},
			updateRoleButtonLoading: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		updateRoleButtonDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("role:update");
			return !checkPermission;
		}
	},
	created() {
		this.getRole();
	},
	methods: {
		async updateRole() {
			this.updateRoleButtonLoading = true;

			const activePermissions = [];
			for (let i in this.permissions) {
				let type = i;

				for (let j in this.permissions[i]) {
					let action = j;
					if (this.permissions[i][j]) {
						activePermissions.push(`${type}:${action}`);
					}
				}
			}

			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "PATCH",
					url: "/api/v1/roles",
					data: {
						id: this.role.id,
						name: this.role.name,
						description: this.role.description,
						permissions: activePermissions
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (response.status === 200) {
					this.$router.push("/dashboard/settings/roles");
				}
				this.updateRoleButtonLoading = false;
			} catch (err) {
				console.error(err);
				this.updateRoleButtonLoading = false;
			}
		},
		async getRole() {
			try {
				const id = this.$route.params.slug;
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "GET",
					url: `/api/v1/roles/${id}`,
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.title = response.data.role.name;
				this.role = response.data.role;

				const permissions = response.data.role.permissions;
				for (let i = 0; i < permissions.length; i++) {
					const type = permissions[i].split(":")[0];
					const action = permissions[i].split(":")[1];

					this.permissions[type][action] = true;
				}
			} catch (err) {
				console.error(err);
			}
		}
	},
	head() {
		return {
			title: `${this.title} • Roles • Dashboard • ${this.settings.title}`
		};
	}
};
</script>
