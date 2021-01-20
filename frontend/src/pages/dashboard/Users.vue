<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<h5 class="breadcrum-item">
					Users
				</h5>
			</div>
		</header>

		<Table class="users-table">
			<template #header>
				<div class="table-header-item users-table-user">
					name
				</div>
				<div class="table-header-item users-table-posts">
					posts
				</div>
				<div class="table-header-item users-table-votes">
					votes
				</div>
			</template>
			<div
				v-for="user in users"
				:key="user.userId"
				class="table-row"
			>
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
			</div>
			<infinite-loading @infinite="getUsers">
				<div slot="spinner" class="loader-container">
					<loader />
				</div>
				<div slot="no-more" />
				<div slot="no-results" />
				<div slot="error" />
			</infinite-loading>
		</Table>
	</div>
</template>

<script>
// packages
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getAllUsers } from "../../modules/users";

// components
import Table from "../../components/Table";
import Avatar from "../../components/Avatar";
import Loader from "../../components/Loader";

export default {
	name: "DashboardUsers",
	components: {
		// package
		InfiniteLoading,

		// component
		Table,
		Avatar,
		Loader
	},
	data() {
		return {
			users: [],
			page: 1
		};
	},
	methods: {
		async getUsers($state) {
			try {
				const response = await getAllUsers(this.page, "desc");

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
		}
	},
	metaInfo() {
		return {
			title: "Users · Dashboard"
		};
	}
};
</script>
