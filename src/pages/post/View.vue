<template>
	<div class="view">
		<div class="viewpost">
			<h2 class="viewpost__title">
				{{ post.title }}
			</h2>
			<div class="viewpost__meta">
				<div class="viewpost__meta-author">
					<avatar class="viewpost__author-avatar" :name="username" />
					{{ username }}
				</div>
				<div class="viewpost__meta-divider">
					|
				</div>
				<div class="viewpost__meta-date">
					{{ post.createdAt | moment("MMMM DD, YYYY") }}
				</div>
				<div v-if="postAuthor" class="viewpost__menu">
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
					</dropdown>
				</div>
			</div>
			<p v-html="post.contentMarkdown" />
		</div>
		<!-- todo: list of user who upvote the post -->
		<!-- <div class="viewvoters">
			<div class="viewvoters__container">
				<div class="viewvoters__users">
					<h6 class="viewvoters__users-heading">
						Voters
					</h6>
				</div>
			</div>
		</div> -->
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

export default {
	name: "PostView",
	data() {
		return {
			menuDropdown: false,
			post: {},
			voters: []
		};
	},
	components: {
		Dropdown,
		DropdownItem,
		Avatar,
		MenuIcon,
		EditIcon
	},
	computed: {
		username() {
			if (this.post.firstname) {
				return `${this.post.firstname}${
					this.post.lastname ? ` ${this.post.lastname}` : ""
				}`;
			}
			return this.post.username;
		},
		postAuthor() {
			const userId = this.$store.getters["user/getUserId"];
			return userId === this.post.userId;
		}
	},
	methods: {
		postBySlug() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${slug}`)
				.then(response => {
					this.post = response.data.post;
					this.voters = response.data.voters;
				})
				.catch(error => {
					const err = { ...error };

					if (err.response.data.error.code === "post_not_found") {
						this.$store.dispatch("alerts/add", {
							title: "Post not found",
							description: "The post you have opened doesn't exist.",
							type: "error",
							timeout: 5000
						});

						this.$router.push("/");
					}
				});
		},
		editPost() {
			this.$router.push(`/post/${this.post.slug}/edit`);
		},
		toggleMenuDropdown() {
			this.menuDropdown = !this.menuDropdown;
		}
	},
	created() {
		this.postBySlug();
	}
};
</script>
