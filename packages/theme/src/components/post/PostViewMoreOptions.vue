<template>
  <dropdown-v2>
    <template #trigger>
      <DropdownMenuTrigger>
        <more-icon aria-hidden="true" class="stroke-neutral-700 size-5" />
        <span class="sr-only">More options</span>
      </DropdownMenuTrigger>
    </template>

    <DropdownV2Content
      align="end"
      side="bottom"
      :loop="true"
    >
      <dropdown-item @click="router.push(`/posts/${post.slug}/edit`)">
        <template #icon>
          <edit-icon aria-hidden="true" />
        </template>
        Edit
      </dropdown-item>
    </DropdownV2Content>
  </dropdown-v2>
</template>

<script setup lang="ts">
import { DropdownMenuTrigger } from "reka-ui";
import { MoreHorizontal as MoreIcon, Edit2 as EditIcon } from "lucide-vue";
import type { IPost } from "@logchimp/types";

import { router } from "../../router";
import DropdownV2 from "../ui/DropdownV2/Dropdown.vue";
import DropdownV2Content from "../ui/DropdownV2/DropdownContent.vue";
import DropdownItem from "../ui/DropdownV2/DropdownItem.vue";

interface Props {
  post: IPost;
}

defineProps<Props>()
</script>
