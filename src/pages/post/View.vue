<template>
	<div class="view">
		<div class="viewpost">
			<h2 class="viewpost__title">
				{{ post.title }}
			</h2>
			<div class="viewpost__meta">
				<div class="viewpost__meta-author">
					<avatar
						class="viewpost__author-avatar"
						:first-name="post.first_name"
						:last-name="post.last_name"
					/>
					{{ authorFullName }}
				</div>
				<div class="viewpost__meta-divider">
					|
				</div>
				<div class="viewpost__meta-date">
					{{ post.created_at | moment("MMMM DD, YYYY") }}
				</div>
				<div class="viewpost__menu">
					<menu-icon
						@click.native="toggleMenuDropdown"
						class="viewpost__menu-icon"
					/>
					<dropdown v-if="menuDropdown" class="viewpost__menu-dropdown">
						<dropdown-item @click.native="editPost">
							<template v-slot:icon>
								<edit-icon />
							</template>
							Edit
						</dropdown-item>
						<dropdown-item @click.native="deletePost">
							<template v-slot:icon>
								<trash-icon />
							</template>
							Delete
						</dropdown-item>
					</dropdown>
				</div>
			</div>
			<p v-html="post.body_markdown" />
		</div>
		<!-- todo: list of member who upvote the post -->
		<div class="viewvoters">
			<div class="viewvoters__container">
				<div class="viewvoters__members">
					<h6 class="viewvoters__members-heading">
						Voters
					</h6>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Dropdown from "../../components/ui/dropdown/DropdownGroup";
import DropdownItem from "../../components/ui/dropdown/DropdownItem";
import Avatar from "../../components/ui/Avatar";

// icons
import MenuIcon from "../../assets/images/icons/menu";
import EditIcon from "../../assets/images/icons/edit";
import TrashIcon from "../../assets/images/icons/trash";

export default {
	name: "PostView",
	data() {
		return {
			menuDropdown: false,
			post: {}
		};
	},
	components: {
		Dropdown,
		DropdownItem,
		Avatar,
		MenuIcon,
		EditIcon,
		TrashIcon
	},
	computed: {
		authorFullName() {
			return this.post.first_name + " " + this.post.last_name;
		}
	},
	methods: {
		getPostBySlug() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/post/${slug}`)
				.then(response => {
					console.log(response);

					this.post = response.data.post;
				})
				.catch(error => {
					console.log(error);
				});
		},
		deletePost() {
			// get memberId and token from localStorage
			const token = localStorage.getItem("authToken");

			axios({
				method: "delete",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/post/delete`,
				params: {
					postId: this.post.post_id
				},
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
				.then(response => {
					console.log(response);

					this.$router.push("/");
				})
				.catch(error => {
					console.log(error);
				});
		},
		editPost() {
			this.$router.push(`/post/${this.post.slug}/edit`);
		},
		toggleMenuDropdown() {
			this.menuDropdown = !this.menuDropdown;
		}
	},
	mounted() {
		this.getPostBySlug();
	}
};
</script>
