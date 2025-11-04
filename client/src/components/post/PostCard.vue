<template>
  <div class="post-card">
    <div class="post-card-main">
      <Vote
        :post-id="post.postId"
        :votes-count="post.voters.votesCount"
        :is-voted="post.voters.viewerVote"
        @update-voters="updateVoters"
      />
      <div style="width: 100%">
        <div class="post-card-section">
          <div>
            <router-link data-test="post-link" :to="`/posts/${post.slug}`">
              <h5>{{ post.title }}</h5>
            </router-link>
            <span
              v-if="!isExpanded"
              data-test="post-board-name"
              class="post-card-board"
            >
              {{ post.board.name }}
            </span>
            <time
              v-else
              data-test="post-date"
              :datetime="post.createdAt"
              :title="$date(post.createdAt).format('dddd, DD MMMM YYYY hh:mm')"
              class="post-date"
            >
              {{ $date(post.createdAt).from() }}
            </time>
          </div>
          <div
            data-test="post-card-toggle"
            :style="{
              transform: isExpanded ? 'rotateX(180deg)' : ''
            }"
            class="post-card-toggle"
            @click="isExpanded = !isExpanded"
          >
            <arrow-top-icon />
          </div>
        </div>
        <p
          v-if="isExpanded"
          data-test="post-card-description"
          class="post-card-description"
        >
          {{ post.contentMarkdown | trim(120) }}
        </p>
      </div>
    </div>
    <div
      v-if="isExpanded"
      data-test="post-card-extra"
      class="post-card-extra"
    >
      <avatar-stack
        :avatars="post.voters.votes"
        :total-count="post.voters.votesCount"
      />
      <board-badge
        :show-board="true"
        :name="post.board.name"
        :color="post.board.color"
        :url="post.board.url"
      />
    </div>
  </div>
</template>

<script>
// pacakges
import { ChevronUp as ArrowTopIcon } from "lucide-vue";

// components
import Vote from "./Vote";
import BoardBadge from "../board/BoardBadge";
import AvatarStack from "../AvatarStack";

export default {
  name: "PostCard",
  components: {
    Vote,
    BoardBadge,
    AvatarStack,

    // icons
    ArrowTopIcon
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      postData: this.post,
      isExpanded: false
    };
  },
  methods: {
    updateVoters(voters) {
      this.postData.voters.votesCount = voters.votesCount;
      this.postData.voters.viewerVote = voters.viewerVote;
    }
  }
};
</script>
