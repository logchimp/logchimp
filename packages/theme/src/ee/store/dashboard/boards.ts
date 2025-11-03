import { ref } from "vue";
import { defineStore } from "pinia";
import type { IBoardPrivate } from "@logchimp/types";

import { getAllBoards } from "../../modules/boards";
import type { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";

export const useDashboardBoards = defineStore("dashboardBoards", () => {
  const boards = ref<IBoardPrivate[]>([]);
  const state = ref<InfiniteScrollStateType>();
  const isLoading = ref<boolean>(false);
  const error = ref<unknown>(undefined);

  const page = ref<number>(1);

  async function fetchBoards() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    isLoading.value = true;
    error.value = undefined;

    try {
      const response = await getAllBoards({
        page: page.value.toString(),
        created: "DESC",
      });

      if (response.data.boards.length) {
        boards.value.push(...response.data.boards);
        page.value += 1;
        state.value = "LOADED";
      } else {
        state.value = "COMPLETED";
      }
    } catch (err) {
      console.error(error);
      error.value = err;
      state.value = "ERROR";
    } finally {
      isLoading.value = false;
    }
  }

  function appendBoard(board: IBoardPrivate) {
    boards.value.unshift(board);
  }

  function updateBoard(board: IBoardPrivate) {
    const boardIdx = boards.value.findIndex(
      (item) => item.boardId === board.boardId,
    );
    if (boardIdx === -1) return;

    if(boards.value[boardIdx]) Object.assign(boards.value[boardIdx], board);
  }

  function removeBoard(boardId: string) {
    const boardIdx = boards.value.findIndex((item) => item.boardId === boardId);
    if (boardIdx === -1) return;

    boards.value.splice(boardIdx, 1);
  }

  return {
    boards,
    state,

    fetchBoards,
    appendBoard,
    updateBoard,
    removeBoard,
  };
});
