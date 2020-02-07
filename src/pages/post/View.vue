<template>
	<div class="viewpost">
		<h2 class="viewpost__title">
			{{ post.title }}
		</h2>
		<div class="viewpost__meta">
			<div class="viewpost__meta-about">
				{{ post.created_at }}
			</div>
			<div class="viewpost__menu">
				<menu-icon
					@click.native="toggleMenuDropdown"
					class="viewpost__menu-icon"
				/>
				<dropdown v-if="menuDropdown" class="viewpost__menu-dropdown">
					<dropdown-item @click.native="deletePost">
						<template v-slot:icon>
							<trash-icon />
						</template>
						Delete
					</dropdown-item>
				</dropdown>
			</div>
		</div>
		<div v-html="post.body_markdown" />
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import Dropdown from "../../components/ui/dropdown/DropdownGroup";
import DropdownItem from "../../components/ui/dropdown/DropdownItem";

// icons
import MenuIcon from "../../assets/images/icons/menu";
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
		MenuIcon,
		TrashIcon
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
		toggleMenuDropdown() {
			this.menuDropdown = !this.menuDropdown;
		}
	},
	mounted() {
		this.getPostBySlug();
	}
};
</script>
