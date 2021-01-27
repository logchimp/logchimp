<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<div class="breadcrum-item">
					Roles
				</div>
			</div>

			<Button
				type="primary"
				:loading="createRoleButtonLoading"
				:disabled="createRoleButtonDisabled"
				@click="createRole"
			>
				Create
			</Button>
		</header>

		<div class="table-container">
			<div class="table-header">
				<div class="table-header-item">
					name
				</div>
				<div class="table-header-item" />
			</div>
			<div class="table-body">
				<div
					v-for="role in roles"
					:key="role.id"
					class="table-row"
				>
					<div class="table-data">
						{{ role.name }}
					</div>
					<div class="table-icon-group boards-table-icons">
						<router-link
							:to="`/dashboard/settings/roles/${role.id}/settings`"
							class="table-data table-data-icon"
						>
							<settings-icon />
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import { Settings as SettingsIcon } from "lucide-vue";

// modules
import { getAllRoles, createRole } from "../../../../modules/roles";

// components
import Button from "../../../../components/Button";

export default {
	name: "SettingsRoles",
	components: {
		// components
		Button,

		// icons
		SettingsIcon
	},
	data() {
		return {
			roles: [],
			createRoleButtonLoading: false
		};
	},
	computed: {
		createRoleButtonDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("role:create");
			return !checkPermission;
		}
	},
	created() {
		this.getRoles();
	},
	methods: {
		async createRole() {
			this.createRoleButtonLoading = true;
			try {
				const response = await createRole();

				const roleId = response.data.role;
				this.$router.push(`/dashboard/settings/roles/${roleId}/settings`);
			} catch (error) {
				console.error(error);
			} finally {
				this.createRoleButtonLoading = false;
			}
		},
		async getRoles() {
			try {
				const response = await getAllRoles();

				this.roles = response.data.roles;
			} catch (error) {
				console.error(error);
			}
		}
	}
};
</script>
