<template>
  <div class="rounded-(--border-radius-default) bg-white group">
    <div class="p-3 flex items-start">
      <Vote
        :post-id="post.postId"
        :votes-count="post.voters.votesCount"
        :is-voted="isVoted"
        @update-voters="updateVoters"
      />
      <div class="w-full">
        <div class="flex items-center w-full gap-x-2">
          <div>
            <router-link data-test="post-link" :to="`/posts/${post.slug}`">
              <div class="text-xl font-medium mb-0.5 break-all text-(--color-text-black)">{{ post.title }}</div>
            </router-link>
            <span
              v-if="!isExpanded && post.board"
              data-test="post-board-name"
              class="uppercase text-sm font-medium break-all text-(--color-gray-70)"
            >
              {{ post.board.name }}
            </span>
            <time
              v-else
              data-test="post-date"
							:title="dayjs(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
              class="post-date"
            >
              {{ dayjs(post.createdAt).fromNow() }}
            </time>
          </div>
          <button
            data-test="post-card-toggle"
            :style="{
              transform: isExpanded ? 'rotateX(180deg)' : ''
            }"
            type="button"
            :class="[
              'ml-auto p-1 cursor-pointer select-none rounded-full',
              'bg-neutral-200/70 group-hover:bg-neutral-300 transition-background',
              'focus:bg-neutral-300 outline-none',
            ]"
            :aria-label="isExpanded ? 'collapse' : 'expand'"
            @click="isExpanded = !isExpanded"
          >
            <arrow-top-icon aria-hidden="true" class="size-5 stroke-neutral-700/70 group-hover:stroke-neutral-70 focus:stroke-neutral-700" />
          </button>
        </div>
        <p
          v-if="isExpanded && post.contentMarkdown"
          data-test="post-card-description"
          class="text-(--color-gray-40) text-sm mt-2 break-all"
        >
          {{ useTrim(post.contentMarkdown || "", 120) }}
        </p>
      </div>
    </div>
    <div
      v-if="isExpanded"
      data-test="post-card-extra"
      class="flex items-center justify-between p-3 border-t border-(--color-gray-95) overflow-hidden"
    >
      <avatar-stack
        :avatars="post.voters.votes"
        :total-count="post.voters.votesCount"
      />
      <board-badge
        v-if="post.board"
        :show-board="true"
        :name="post.board.name"
        :color="post.board.color"
        :url="post.board.url"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronUp as ArrowTopIcon } from "lucide-vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { IPost, IPostVote } from "@logchimp/types";

import { useTrim } from "../../../hooks";

// components
import Vote from "../../../components/vote/Vote.vue";
import BoardBadge from "../../../components/board/BoardBadge.vue";
import { AvatarStack } from "../../../components/ui/Avatar";

dayjs.extend(relativeTime);

interface Props {
  post: IPost;
}

const props = defineProps<Props>();

const isExpanded = ref(false);
const postData = ref(props.post);
const isVoted = computed<boolean>(() =>
  Boolean(props.post.voters?.viewerVote?.voteId),
);

function updateVoters(voters: IPostVote) {
  postData.value.voters.votesCount = voters.votesCount;
  postData.value.voters.viewerVote = voters.viewerVote;
}
</script>

