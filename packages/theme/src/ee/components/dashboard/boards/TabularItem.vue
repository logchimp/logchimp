<template>
  <div class="flex justify-center w-14">
    <div
      class="w-3 h-3 rounded-full"
      :style="{
        backgroundColor: `#${board.color}`
      }"
    />
  </div>
  <div class="table-data boards-table-name">
    {{ board.name }}
  </div>
  <div class="table-data boards-table-posts">
    {{ board.post_count }}
  </div>
  <div class="table-icon-group boards-table-icons">
    <router-link
      :to="`/boards/${board.url}`"
      class="table-data table-data-icon boards-table-icon-link"
    >
      <link-icon aria-hidden="true" />
    </router-link>
    <div class="table-data table-data-icon">
      <eye-icon aria-hidden="true" v-if="board.display" />
      <eye-off-icon aria-hidden="true" v-else />
    </div>
    <DashboardBoardsTabularItemMoreOptionsDropdown :board="board" :index="index" />
  </div>
</template>

<script setup lang="ts">
import {
  Link as LinkIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from "lucide-vue";
import type { IBoardPrivate } from "@logchimp/types";

import DashboardBoardsTabularItemMoreOptionsDropdown from "./MoreOptionsDropdown.vue";

interface Props {
  board: IBoardPrivate;
  index: number;
}

defineProps<Props>();

defineOptions({
  name: "DashboardBoardsTabularItem",
});
</script>
