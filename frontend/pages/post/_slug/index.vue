<template>
	<div v-if="!post.loading">
		<div v-if="isPostExist" class="viewpost">
			<div class="viewpost__vote">
				<div>
					<Vote
						:post-id="post.postId"
						:voters="voters"
						@update-voters="updateVoters"
					/>
				</div>
				<div class="viewpost__content">
					<h2 class="viewpost__title">
						{{ post.title }}
					</h2>
					<div class="viewpost__meta">
						<div class="viewpost__meta-author">
							<avatar
								class="viewpost__author-avatar"
								:src="userAvatar"
								:name="fullname"
							/>
							{{ postAuthorName }}
						</div>
						<div class="viewpost__meta-divider">
							|
						</div>
						<div class="viewpost__meta-date">
							{{ postDate }}
						</div>
						<div
							v-if="postAuthor"
							@mouseleave="addPostViewDropdownListener"
							class="dropdown-menu-container viewpost__menu"
						>
							<div @click="toggleMenuDropdown" class="dropdown-menu-icon">
								<more-icon />
							</div>
							<dropdown v-if="menuDropdown" class="viewpost__menu-dropdown">
								<dropdown-item @click="editPost">
									<template v-slot:icon>
										<edit-icon />
									</template>
									Edit
								</dropdown-item>
							</dropdown>
						</div>
					</div>
				</div>
			</div>
			<p v-html="post.contentMarkdown" />
		</div>
		<p v-else>
			There is no such post.
		</p>
	</div>
	<div v-else class="loader-container loader">
		<loader-icon />
	</div>
</template>

<script>
// packages
import { MoreHorizontal, Edit2 } from "lucide";

// components
import Vote from "@/components/post/Vote";
import Dropdown from "@/components/dropdown/Dropdown";
import DropdownItem from "@/components/dropdown/DropdownItem";
import Avatar from "@/components/Avatar";

// mixins
import lucideIcon from "@/mixins/lucideIcon.js";
import userAvatar from "@/mixins/userAvatar";

// icons
import LoaderIcon from "@/components/icons/Loader";
const MoreIcon = lucideIcon("MoreHorizontal", MoreHorizontal);
const EditIcon = lucideIcon("Edit2", Edit2);

export default {
	name: "PostView",
	data() {
		return {
			menuDropdown: false,
			post: {
				loading: false
			},
			voters: [],
			isPostExist: true
		};
	},
	components: {
		// components
		Vote,
		Dropdown,
		DropdownItem,
		Avatar,

		// icons
		LoaderIcon,
		MoreIcon,
		EditIcon
	},
	mixins: [userAvatar],
	computed: {
		postAuthorName() {
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
		},
		postDate() {
			return this.$moment(this.post.createdAt).format("MMMM DD, YYYY");
		},
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	methods: {
		// event listener to hide dropdown by clicking outside
		addPostViewDropdownListener() {
			document.addEventListener("click", this.removePostViewDropdownListener);
		},
		removePostViewDropdownListener() {
			this.toggleMenuDropdown();
			document.removeEventListener(
				"click",
				this.removePostViewDropdownListener
			);
		},
		toggleMenuDropdown() {
			this.menuDropdown = !this.menuDropdown;
		},
		async postBySlug() {
			this.post.loading = true;
			const slug = this.$route.params.slug;

			try {
				const response = await this.$axios.$get(`/api/v1/posts/${slug}`);

				this.post = response.post;
				this.voters = response.voters;

				this.post.loading = false;
			} catch (error) {
				if (error.response.data.code === "POST_NOT_FOUND") {
					this.isPostExist = false;
				}

				this.post.loading = false;
			}
		},
		updateVoters(voters) {
			this.voters = voters;
		},
		editPost() {
			this.$router.push(`/post/${this.post.slug}/edit`);
		}
	},
	created() {
		this.postBySlug();
	},
	metaInfo() {
		return {
			title: `${this.post.title} · Post`,
			meta: [
				{
					name: "description",
					content: `${this.post.contentMarkdown}`
				},

				// openGraph
				{
					name: "og:title",
					content: `${this.post.title} · Post · ${this.getSiteSittings.title}`
				},
				{
					name: "og:description",
					content: `${this.post.contentMarkdown}`
				}
			]
		};
	}
};
</script>
