<template>
	<div v-if="!post.loading">
		<div v-if="isPostExist" class="viewpost">
			<div class="viewpost__vote">
				<div>
					<Vote
						:post-id="post.postId"
						:votes-count="post.voters.votesCount"
						:is-voted="post.voters.viewerVote"
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
								:src="post.author.avatar"
								:name="post.author.name"
							/>
							{{ postAuthorName }}
						</div>
						<div class="viewpost__meta-divider">
							|
						</div>
						<div class="viewpost__meta-date">
							{{ post.createdAt | moment("MMMM DD, YYYY") }}
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
	<div v-else class="loader-container">
		<loader />
	</div>
</template>

<script>
// modules
import { getPostBySlug } from "../../../modules/posts";

// components
import Loader from "../../../components/Loader";
import Vote from "../../../components/post/Vote";
import Dropdown from "../../../components/dropdown/Dropdown";
import DropdownItem from "../../../components/dropdown/DropdownItem";
import Avatar from "../../../components/Avatar";

// icons
import MoreIcon from "../../../components/icons/More";
import EditIcon from "../../../components/icons/Edit";

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
		Loader,
		Vote,
		Dropdown,
		DropdownItem,
		Avatar,
		MoreIcon,
		EditIcon
	},
	computed: {
		postAuthorName() {
			return this.post.author.name
				? this.post.author.name
				: this.post.author.username;
		},
		postAuthor() {
			const userId = this.$store.getters["user/getUserId"];
			return userId === this.post.userId;
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
				const response = await getPostBySlug(slug);

				this.post = response.data.post;
				this.voters = response.data.voters;
			} catch (error) {
				if (error.response.data.code === "POST_NOT_FOUND") {
					this.isPostExist = false;
				}
			} finally {
				this.post.loading = false;
			}
		},
		updateVoters(voters) {
			this.post.voters.votesCount = voters.votesCount;
			this.post.voters.viewerVote = voters.viewerVote;
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
