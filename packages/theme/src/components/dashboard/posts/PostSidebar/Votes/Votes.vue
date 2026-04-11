<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-neutral-700 font-medium">
        {{votes.length}} Voter{{votes.length === 1 ? '' : 's'}}
      </span>

      <button
        class="border border-neutral-300 hover:bg-neutral-100 bg-white text-sm font-medium text-neutral-700 px-2 py-1 rounded-md"
        @click="isUserDropdownOpened = !isUserDropdownOpened"
      >
        Add new voter
      </button>
    </div>

    <template v-if="loading">
      Loading...
    </template>
    <template v-else-if="votes.length > 0">
      <div class="flex items-center -space-x-3.5 mb-2">
        <Avatar
          v-for="vote in votes"
          :key="vote.voteId"
          :name="vote.user.name || vote.user.username || ''"
          :src="vote.user.avatar || ''"
        />
      </div>
    </template>

    <UserSelectorList
      v-if="isUserDropdownOpened"
      :post-id="postId"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from "vue";
import type { IUserVoteV2 } from "@logchimp/types";

import { Posts } from "../../../../../modules/posts";
import { Avatar } from "../../../../ui/Avatar";
const UserSelectorList = defineAsyncComponent(
  () =>
    import("../../../../../ee/components/dashboard/users/UserSelectorList.vue"),
);

const votes = ref<Array<IUserVoteV2>>([]);
const loading = ref(false);
const postService = new Posts();

interface Props {
  postId: string;
}
const props = defineProps<Props>();
const isUserDropdownOpened = ref(false);

async function getVotes() {
  if (loading.value) return;

  loading.value = true;

  try {
    const data = await postService.getPostVotes(props.postId, {
      first: "10",
    });
    votes.value = data.votes.results;
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getVotes();
});
</script>
