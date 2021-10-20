<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">Users</h5>
			</div>
		</header>

		<Table class="users-table">
			<template #header>
				<div class="table-header-item users-table-user">name</div>
				<div class="table-header-item users-table-posts">posts</div>
				<div class="table-header-item users-table-votes">votes</div>
				<div
					v-if="isDeveloperMode"
					class="table-header-item users-table-votes"
				/>
			</template>
			<div v-for="user in users" :key="user.userId" class="table-row">
				<div class="table-data users-table-user">
					<div class="users-table-user-avatar">
						<avatar :src="user.avatar" :name="user.name || user.username" />
					</div>
					<h6 class="users-table-user-name">
						{{ user.name || user.username }}
					</h6>
				</div>
				<div class="table-data users-table-posts">
					{{ user.posts }}
				</div>
				<div class="table-data users-table-votes">
					{{ user.votes }}
				</div>
				<div v-if="isDeveloperMode" class="table-icon-group boards-table-icons">
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
							<dropdown v-if="dropdown.active" class="sw">
								<dropdown-item @click="copyText(user.userId)">
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
				<infinite-loading @infinite="getUsers">
					<div slot="spinner" class="loader-container">
						<loader />
					</div>
					<div slot="no-more" />
					<div slot="no-results" />
					<div slot="error" />
				</infinite-loading>
			</client-only>
		</Table>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import { Clipboard as CopyIcon, MoreHorizontal as MoreIcon } from "lucide-vue";
import InfiniteLoading from "vue-infinite-loading";

// components
import Table from "../../../components/ui/Table.vue";
import Avatar from "../../../components/ui/Avatar.vue";
import Loader from "../../../components/ui/Loader.vue";
import DropdownWrapper from "../../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../../components/ui/dropdown/DropdownItem.vue";

export default {
	name: "DashboardUsers",
	layout: "dashboard",
	components: {
		// package
		InfiniteLoading,

		// component
		Table,
		Avatar,
		Loader,
		DropdownWrapper,
		Dropdown,
		DropdownItem,

		// icons
		CopyIcon,
		MoreIcon
	},
	data() {
		return {
			users: [],
			page: 1
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		isDeveloperMode() {
			return this.$store.getters["settings/get"].developer_mode;
		}
	},
	methods: {
		async getUsers($state) {
			try {
				const response = await this.$axios({
					method: "GET",
					url: "/api/v1/users",
					params: {
						page: this.page,
						created: "DESC"
					}
				});

				if (response.data.users.length) {
					this.users.push(...response.data.users);
					this.page += 1;
					$state.loaded();
				} else {
					$state.complete();
				}
			} catch (error) {
				$state.error();
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
			title: `Users • Dashboard • ${this.settings.title}`
		};
	}
};
</script>

<style lang='sass'>
.users-table
	.users-table-user
		display: flex
		align-items: center
		flex: 6

		.users-table-user-avatar
			margin-right: 0.5rem

		.users-table-user-name
			margin-bottom: 0

	.users-table-posts
		flex: 1

	.users-table-votes
		flex: 1
</style>
