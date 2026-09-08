<script setup lang="ts">
import { ref } from "vue";
import type { IApiErrorResponse, IBoardPrivate } from "@logchimp/types";
import { CircleXIcon } from "lucide-vue";

import Table from "../../../../components/ui/Table/Table.vue";
import ColorDot from "../../../../components/ui/ColorDot/ColorDot.vue";
import Tr from "../../../../components/ui/Table/Tr.vue";
import Td from "../../../../components/ui/Table/Td.vue";
import InfiniteScroll, {
  type InfiniteScrollStateType,
} from "../../../../components/ui/InfiniteScroll.vue";
import { getAllBoards } from "../../../modules/boards.ts";
import type { AxiosError } from "axios";

const boards = ref<IBoardPrivate[]>([]);
const state = ref<InfiniteScrollStateType>();
const errorCode = ref<string | null>(null);

async function getBoards() {
  if (state.value === "LOADING" || state.value === "COMPLETED") return;
  state.value = "LOADING";

  try {
    const response = await getAllBoards({
      page: "1",
      limit: "4",
      created: "DESC",
    });

    boards.value = response.data.boards;
    state.value = "COMPLETED";
  } catch (error) {
    const err = error as AxiosError<IApiErrorResponse>;
    state.value = "ERROR";

    if (err.response?.data?.code === "LICENSE_VALIDATION_FAILED") {
      errorCode.value = err.response.data.code;
    }
  }
}
</script>

<template>
  <div
    v-if="errorCode === 'LICENSE_VALIDATION_FAILED'"
    class="border border-dashed border-red-300/80 rounded-lg p-4 text-center flex flex-col items-center gap-y-2.5"
  >
    <CircleXIcon class="stroke-red-600" />
    <span class="text-neutral-700 text-sm">
      Failed to display boards.
    </span>
  </div>
  <Table v-else>
    <template #header>
      <Td
        :head="true"
        :style="{
          minWidth: '350px',
        }"
        class="flex-1"
      >
        Name
      </Td>
      <Td
        :style="{
          width: '100px',
        }"
        :head="true"
      >
        Posts
      </Td>
    </template>

    <Tr
      v-for="board in boards"
      :key="board.boardId"
    >
      <div class="flex items-center">
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
      </div>
    </Tr>

    <template #infinite-loader>
      <infinite-scroll :on-infinite="getBoards" :state="state" />
    </template>
  </Table>
</template>