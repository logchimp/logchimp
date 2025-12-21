<template>
  <Dialog v-model:open="showDialog">
    <l-text
      v-model="title.value"
      label="Title"
      type="text"
      name="Post title"
      data-test="post-title"
      placeholder="Name of the feature"
      :error="title.error"
      :disabled="createPostPermissionDisabled"
      @keyup-enter="submitPost"
      @hide-error="hideTitleError"
    />
    <l-textarea
      v-model="description"
      label="Description"
      rows="4"
      name="Post description"
      placeholder="What would you use it for?"
      :disabled="createPostPermissionDisabled"
    />
    <template #footer>
       <Button
        type="primary"
        data-test="submit-post-button"
        :loading="loading"
        :disabled="createPostPermissionDisabled"
        @click="submitPost"
      >
        Submit
      </Button>
    </template>

  </Dialog>

  <div class="flex justify-center mb-8">
    <Button
        type="primary"
        data-test="create-post-button"
        @click="showDialog = true"
      >
        Submit Feedback
    </Button>
  </div>

  <div class="flex flex-col-reverse lg:flex-row mb-16 lg:gap-x-8">
    <main class="grow-[2] shrink basis-0">
      <post-item
        v-for="post in posts"
        :key="post.postId"
        :post="post"
      />

      <infinite-scroll :on-infinite="loadMorePosts" :state="state" />
    </main>
    <aside class="flex-1 h-full mb-6 lg:mb-0 grid grid-cols-1 gap-y-4 lg:sticky lg:top-20">
      <site-setup-card v-if="showSiteSetupCard" />
      <login-card v-if="!userStore.getUserId && !showSiteSetupCard" />
      <top-public-boards-list />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, computed } from "vue";
import { useHead } from "@vueuse/head";
import type { IPost } from "@logchimp/types";

// modules
import { isSiteSetup } from "../modules/site";
import { getPosts } from "../modules/posts";
import { useSettingStore } from "../store/settings";
import { useUserStore } from "../store/user";
import { createPost } from "../modules/posts";
import { router } from "../router";

// components
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../components/ui/InfiniteScroll.vue";
import PostItem from "../components/post/PostItem.vue";
import SiteSetupCard from "../components/site/SiteSetupCard.vue";
import LoginCard from "../components/auth/LoginCard.vue";
import TopPublicBoardsList from "../ee/components/TopPublicBoardsList.vue";
import Dialog from "../components/ui/Dialog/Dialog.vue";
import LText from "../components/ui/input/LText.vue";
import LTextarea from "../components/ui/input/LTextarea.vue";
import Button from "../components/ui/Button.vue";
import type { FormFieldErrorType } from "../components/ui/input/formBaseProps";

// utils
import validateUUID from "../utils/validateUUID";
import tokenError from "../utils/tokenError";

const { permissions } = useUserStore();

const props = defineProps({
  boardId: {
    type: String,
    required: true,
    validator: validateUUID,
  },
  dashboard: {
    type: Boolean,
    default: false,
  },
});

const showDialog = ref(false);
const title = reactive({
  value: "",
  error: {
    show: false,
    message: "",
  },
});
const description = ref<string>("");
const loading = ref<boolean>(false);

const dashboardUrl = computed(() => (props.dashboard ? "/dashboard" : ""));
const createPostPermissionDisabled = computed(() => {
  const checkPermission = permissions.includes("post:create");
  return !checkPermission;
});

function hideTitleError(event: FormFieldErrorType) {
  title.error = event;
}

const settingsStore = useSettingStore();
const userStore = useUserStore();

const posts = ref<IPost[]>([]);
const page = ref<number>(1);
const showSiteSetupCard = ref<boolean>(false);
const state = ref<InfiniteScrollStateType>();

async function isSetup() {
  try {
    const response = await isSiteSetup();
    showSiteSetupCard.value = !response.data.is_setup;
  } catch (error) {
    console.error(error);
  }
}

async function loadMorePosts() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;

  state.value = "LOADING";

  try {
    const response = await getPosts({
      page: page.value.toString(),
      created: "DESC",
      boardId: [],
    });

    if (response.data.posts.length) {
      posts.value.push(...response.data.posts);
      page.value += 1;
      state.value = "LOADED";
    } else {
      state.value = "COMPLETED";
    }
  } catch (error) {
    console.error(error);
    state.value = "ERROR";
  }
}

onMounted(() => isSetup());

useHead({
  title: "Home",
  meta: [
    {
      name: "og:title",
      content: () => `Home • ${settingsStore.get.title}`,
    },
  ],
});

defineOptions({
  name: "Homepage",
});

async function submitPost() {
  if (!title.value) {
    title.error.show = true;
    title.error.message = "You forgot to enter a post title";
    return;
  }

  loading.value = true;

  try {
    const response = await createPost({
      title: title.value,
      contentMarkdown: description.value,
      boardId: props.boardId,
    });

    // redirect to post
    const slug = response.data.post.slug;
    router.push(`${dashboardUrl.value}/posts/${slug}`);
  } catch (error) {
    tokenError(error);
  } finally {
    loading.value = false;
  }
}
</script>
