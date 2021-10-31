<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<div class="breadcrum-item">Roles</div>
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
				<div class="table-header-item">name</div>
				<div class="table-header-item" />
			</div>
			<div class="table-body">
				<div v-for="role in roles" :key="role.id" class="table-row">
					<div class="table-data">
						{{ role.name }}
					</div>
					<div class="table-icon-group boards-table-icons">
						<a
							:href="`/dashboard/settings/roles/${role.id}/settings`"
							class="table-data table-data-icon"
						>
							<settings-icon />
						</a>
						<dropdown-wrapper v-if="isDeveloperMode">
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
									<dropdown-item @click="copyText(role.id)">
										<template #icon>
											<copy-icon />
										</template>
										Copy ID
									</dropdown-item>
								</dropdown>
							</template>
						</dropdown-wrapper>
					</div>
				</div>
				<client-only>
					<infinite-loading @infinite="getRoles">
						<div slot="spinner" class="loader-container">
							<loader />
						</div>
						<div slot="no-more" />
						<div slot="no-results" />
						<div slot="error" />
					</infinite-loading>
				</client-only>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import {
	Settings as SettingsIcon,
	Clipboard as CopyIcon,
	MoreHorizontal as MoreIcon
} from "lucide-vue";
import InfiniteLoading from "vue-infinite-loading";

// components
import Button from "../../../../components/ui/Button.vue";
import DropdownWrapper from "../../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../../components/ui/dropdown/DropdownItem.vue";
import Loader from "../../../../components/ui/Loader.vue";

export default {
	name: "Roles",
	layout: "dashboard",
	components: {
		// packages
		InfiniteLoading,

		// components
		Button,
		DropdownWrapper,
		Dropdown,
		DropdownItem,
		Loader,

		// icons
		SettingsIcon,
		CopyIcon,
		MoreIcon
	},
	data() {
		return {
			roles: [],
			createRoleButtonLoading: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		createRoleButtonDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("role:create");
			return !checkPermission;
		},
		isDeveloperMode() {
			return this.$store.getters["settings/get"].developer_mode;
		}
	},
	methods: {
		async createRole() {
			this.createRoleButtonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "POST",
					url: "/api/v1/roles",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const roleId = response.data.role;
				this.$router.push(`/dashboard/settings/roles/${roleId}/settings`);
				this.createRoleButtonLoading = false;
			} catch (error) {
				console.error(error);
				this.createRoleButtonLoading = false;
			}
		},
		async getRoles($state) {
			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/roles",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				this.roles = response.data.roles;
				$state.complete();
			} catch (error) {
				console.error(error);
				$state.error();
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
			title: `Roles • Dashboard • ${this.settings.title}`
		};
	}
};
</script>
