<template>
  <loader-container v-if="postLoading" />
	<template v-else>
		<div v-if="isPostExist" class="flex-2">
			<div class="flex items-start">
				<div>
					<vote
						:post-id="post.postId"
						:votes-count="post.voters.votesCount"
						:is-voted="isVoted"
						@update-voters="updateVoters"
					/>
				</div>
				<div class="w-full">
					<h1 class="font-medium text-4xl mb-2.5">
						{{ post.title }}
					</h1>
					<div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-x-4">
              <div class="flex items-center gap-x-2">
                <avatar
                  :src="post.author.avatar || undefined"
                  :name="postAuthorName"
                />
                {{ postAuthorName }}
              </div>
              <div class="bg-neutral-300 h-4 w-px" aria-hidden="true"/>
              <time
                :title="dayjs(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
                class="text-sm text-neutral-700"
              >
                {{ dayjs(post.createdAt).fromNow() }}
              </time>
            </div>

						<PostViewMoreOptions v-if="postAuthor" :post="post" class="ml-auto" />
					</div>
				</div>
			</div>

			<p v-html="postContent" />

      <PostActivityList :post-id="post.postId" />
		</div>
		<p v-else>
			There is no such post.
		</p>
	</template>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { IPost, IPostVote } from "@logchimp/types";

// modules
import { router } from "../../../router";
import { useSettingStore } from "../../../store/settings";
import { useUserStore } from "../../../store/user";
import { getPostBySlug } from "../../../modules/posts";

// components
import LoaderContainer from "../../../components/ui/LoaderContainer.vue";
import Vote from "../../../components/vote/Vote.vue";
import { Avatar } from "../../../components/ui/Avatar";
import PostActivityList from "../../../ee/components/posts/PostActivityList.vue";
import PostViewMoreOptions from "../../../components/post/PostViewMoreOptions.vue";

const { permissions, getUserId } = useUserStore();
const { get: siteSettings } = useSettingStore();

dayjs.extend(relativeTime);

// posts
const post = reactive<IPost>({
  postId: "",
  title: "",
  slug: "",
  contentMarkdown: "",
  // TODO: what should be the default/empty value
  updatedAt: new Date(),
  // TODO: what should be the default/empty value
  createdAt: new Date(),
  author: {
    name: "",
    username: "",
    avatar: null,
    userId: "",
  },
  board: null,
  roadmap: null,
  voters: {
    votesCount: 0,
    viewerVote: undefined,
    votes: [],
  },
});
const postContent = ref<string>("");
const postLoading = ref(false);
const isPostExist = ref(false);

const isVoted = computed<boolean>(
  () => !!post.voters?.viewerVote?.voteId || false,
);

const postAuthorName = computed(() => post.author.name || post.author.username);

const postAuthor = computed(() => {
  const checkPermission = permissions.includes("post:update");
  const authorId = post.author.userId;

  if (!checkPermission && getUserId !== authorId) return false;
  return true;
});

async function postBySlug() {
  postLoading.value = true;
  const route = router.currentRoute.value;

  if (route.params.slug) {
    try {
      const slug = route.params.slug.toString();
      const response = await getPostBySlug(slug);

      postLoading.value = false;
      Object.assign(post, response.data.post);
      isPostExist.value = true;

      if (response.data.post?.contentMarkdown) {
        postContent.value = response.data.post.contentMarkdown.replace(
          /\n/g,
          "<br>",
        );
      }
    } catch (error: unknown) {
      // @ts-expect-error
      if (error?.response?.data?.code === "POST_NOT_FOUND") {
        postLoading.value = false;
        isPostExist.value = false;
      }
    }
  }
}

function updateVoters(voters: IPostVote) {
  post.voters.votesCount = voters.votesCount;
  post.voters.viewerVote = voters.viewerVote;
}

onMounted(() => postBySlug());

useHead({
  title: () => `${post.title ? `${post.title} • ` : ""}Post`,
  meta: [
    {
      name: "description",
      content: () => post.contentMarkdown,
    },

    // openGraph
    {
      name: "og:title",
      content: () =>
        `${post.title ? `${post.title} • ` : ""}Post • ${siteSettings.title}`,
    },
    {
      name: "og:description",
      content: () => post.contentMarkdown,
    },
  ],
});

defineOptions({
  name: "PostView",
});
</script>
