import { ref } from "vue";
import type { IBoardPrivate } from "@logchimp/types";

export type TCurrentBoard = IBoardPrivate | null;
const currentBoard = ref<TCurrentBoard>(null);

export function useBoardSearch() {
  function select(_board: TCurrentBoard) {
    currentBoard.value = _board;
  }

  function clear() {
    currentBoard.value = null;
  }

  return {
    board: currentBoard,

    select,
    clear,
  };
}
