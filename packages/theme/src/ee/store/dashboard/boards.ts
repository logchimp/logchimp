import { ref } from "vue";
import { defineStore } from "pinia";
import type { components } from "@logchimp/api-ts-types";
import type { AxiosError } from "axios";

import { BoardsEE } from "../../modules/boards";
import type { InfiniteScrollStateType } from "../../../components/ui/InfiniteScroll.vue";

const boardsEEAPI = new BoardsEE();

export const useDashboardBoards = defineStore("dashboardBoards", () => {
  const boards = ref<components["schemas"]["BoardPrivate"][]>([]);
  const state = ref<InfiniteScrollStateType>("IDLE");
  const errorCode = ref<unknown>(undefined);

  const page = ref<number>(1);

  async function fetchBoards() {
    if (state.value === "LOADING" || state.value === "COMPLETED") return;

    state.value = "LOADING";
    errorCode.value = undefined;

    try {
      const response = await boardsEEAPI.GetAllBoards({
        page: page.value.toString(),
        created: "DESC",
      });

      if (response.boards.length) {
        boards.value.push(...response.boards);
        page.value += 1;
        state.value = "LOADED";
      } else {
        state.value = "COMPLETED";
      }
    } catch (error) {
      const err = error as AxiosError<
        components["schemas"]["GenericAPIErrorResponseBody"]
      >;
      state.value = "ERROR";

      if (err.response?.status === 404) {
        errorCode.value = "LICENSE_INSUFFICIENT_TIER";
        return;
      }

      // HTTP API error handling
      switch (err.response?.data?.code) {
        case "LICENSE_VALIDATION_FAILED":
        case "LICENSE_INSUFFICIENT_TIER":
          errorCode.value = err.response.data.code;
          return;
      }
    }
  }

  function appendBoard(board: components["schemas"]["BoardPrivate"]) {
    boards.value.unshift(board);
  }

  function updateBoard(board: components["schemas"]["BoardPrivate"]) {
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
