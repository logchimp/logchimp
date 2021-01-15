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
	</div>
</template>

<script>
// modules
import { createRole } from "../../../../modules/roles";

// components
import Button from "../../../../components/Button";

export default {
	name: "SettingsRoles",
	components: {
		// components
		Button
	},
	data() {
		return {
			createRoleButtonLoading: false
		};
	},
	computed: {
		createRoleButtonDisabled() {
			return false;
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
		}
	}
};
</script>
