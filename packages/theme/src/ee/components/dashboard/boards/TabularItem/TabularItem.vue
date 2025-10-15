<template>
  <div class="flex items-center">
    <Td />
    <Td
      :style="{
        minWidth: '350px',
      }"
      class="flex-1 flex items-center gap-x-3"
    >
      <ColorDot :color="board.color" />
      <span>
        {{ board.name }}
      </span>
    </Td>

    <Td
      :style="{
        width: '100px',
      }"
    >
      {{ board.post_count }}
    </Td>

    <Td
      :style="{
        width: '50px',
      }"
      :ignore-px="true"
    >
      <div class="flex items-center justify-center">
        <component
          :is="board.display ? EyeIcon : EyeOffIcon"
          aria-hidden="true"
          class="size-5 stroke-neutral-400"
        />
      </div>
    </Td>
    <Td
      :style="{
        width: '40px',
      }"
      :ignore-px="true"
      :ignore-py="true"
    >
      <div class="flex items-center justify-center">
        <MoreOptionsDropdown />
      </div>
    </Td>
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-vue";
import type { IBoardPrivate } from "@logchimp/types";

import { boardKey } from "./options";
import MoreOptionsDropdown from "./MoreOptionsDropdown.vue";
import ColorDot from "../../../../../components/ui/ColorDot/ColorDot.vue";
import Td from "../../../../../components/ui/Table/Td.vue";

interface Props {
  board: IBoardPrivate;
}
const props = defineProps<Props>();
provide(boardKey, props.board);

defineOptions({
  name: "DashboardBoardsTabularItem",
});
</script>
