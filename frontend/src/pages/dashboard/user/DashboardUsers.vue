<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Users</h4>
		</div>

		<Table class="users-table">
			<template v-slot:header>
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
			<div v-for="user in users" :key="user.userId" class="table-row">
				<div class="table-data users-table-user">
					<div class="users-table-user-avatar">
						<avatar
							:src="user.avatar"
							:name="user.firstname ? user.firstname : user.username"
						/>
					</div>
					<h6 class="users-table-user-name">
						{{ user.firstname ? user.firstname : user.username }}
					</h6>
				</div>
				<div class="table-data users-table-posts">{{ user.posts }}</div>
				<div class="table-data users-table-votes">{{ user.votes }}</div>
			</div>
			<infinite-loading @infinite="getUsers">
				<div class="loader-container" slot="spinner"><loader /></div>
				<div slot="no-more"></div>
				<div slot="no-results"></div>
				<div slot="error"></div>
			</infinite-loading>
		</Table>
	</div>
</template>

<script>
// packages
import axios from "axios";
import InfiniteLoading from "vue-infinite-loading";

// components
import Table from "../../../components/Table";
import Avatar from "../../../components/Avatar";
import Loader from "../../../components/Loader";

export default {
	name: "DashboardUsers",
	data() {
		return {
			users: [],
			page: 1
		};
	},
	components: {
		// package
		InfiniteLoading,

		// component
		Table,
		Avatar,
		Loader
	},
	computed: {
		username() {
			if (this.post.firstname) {
				return `${this.post.firstname}${
					this.post.lastname ? ` ${this.post.lastname}` : ""
				}`;
			}
			return this.post.username;
		}
	},
	methods: {
		getUsers($state) {
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/users`,
				params: {
					page: this.page,
					created: "desc"
				}
			})
				.then(response => {
					if (response.data.users.length) {
						this.users.push(...response.data.users);
						this.page += 1;
						$state.loaded();
					} else {
						$state.complete();
					}
				})
				.catch(error => {
					$state.error();
					console.log(error);
				});
		}
	}
};
</script>
