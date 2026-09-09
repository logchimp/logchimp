import { ref } from "vue";
import { defineStore } from "pinia";
import type { IApiErrorResponse, IBoardPrivate } from "@logchimp/types";
import type { AxiosError } from "axios";

import { getAllBoards } from "../../modules/boards";
import type { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";

export const useDashboardBoards = defineStore("dashboardBoards", () => {
  const boards = ref<IBoardPrivate[]>([]);
  const state = ref<InfiniteScrollStateType>("IDLE");
  const errorCode = ref<unknown>(undefined);

  const page = ref<number>(1);

  async function fetchBoards() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    errorCode.value = undefined;

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
    } catch (error) {
      const err = error as AxiosError<IApiErrorResponse>;
      state.value = "ERROR";

      if (err.response?.data?.code === "LICENSE_VALIDATION_FAILED") {
        errorCode.value = err.response.data.code;
      }
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
    if (!boards.value[boardIdx]) return;

    Object.assign(boards.value[boardIdx], board);
  }

  function removeBoard(boardId: string) {
    const boardIdx = boards.value.findIndex((item) => item.boardId === boardId);
    if (boardIdx === -1) return;

    boards.value.splice(boardIdx, 1);
  }

  return {
    boards,
    state,
    error: errorCode,

    fetchBoards,
    appendBoard,
    updateBoard,
    removeBoard,
  };
});
