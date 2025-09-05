import { ref } from "vue"
import type { IBoardPrivate } from "@logchimp/types";

const currentBoard = ref<IBoardPrivate>();

export function useBoardSearch() {
  function select(_board: IBoardPrivate) {
    currentBoard.value = _board;
  }

  function clear() {
    currentBoard.value = undefined;
  }

  return {
    board: currentBoard,

    select,
    clear,
  }
}