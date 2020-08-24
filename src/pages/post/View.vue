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
		}
	},
	methods: {
		postBySlug() {
			const slug = this.$route.params.slug;

			axios
				.get(`${process.env.VUE_APP_SEVER_URL}/api/v1/posts/${slug}`)
				.then(response => {
					this.post = response.data.post;
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
	created() {
		this.postBySlug();
	}
};
</script>
