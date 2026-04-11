<template>
  <template v-if="loading">
    Loading...
  </template>
  <template v-else-if="isError">
    Something went wrong. Please try again later.
  </template>
  <div v-else class="max-h-60 overflow-y-auto h-full border border-neutral-300 rounded-md">
    <button
      type="button"
      v-for="user in users"
      :key="user.userId"
      @click="addVote(user.userId)"
    >
      {{ user.name || user.username }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { IUser } from "@logchimp/types";

import { Users as UserService } from "../../../../modules/users";
import { PostsEE as PostEEService } from "../../../../ee/modules/posts";

const users = ref<Array<IUser>>([]);
const loading = ref(false);
const isError = ref(false);

const userService = new UserService();
const postEEService = new PostEEService();

interface Props {
  postId: string;
}
const props = defineProps<Props>();

async function getVotes() {
  if (loading.value) return;

  loading.value = true;

  try {
    const data = await userService.getAll({});

    users.value = data.users;
  } catch (e) {
    isError.value = true;
  } finally {
    loading.value = false;
  }
}

async function addVote(userId: string) {
  await postEEService.castVoteOnBehalf(props.postId, userId);
}

onMounted(() => {
  getVotes();
});
</script>
