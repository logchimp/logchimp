import { ref } from "vue";
import type { components } from "@logchimp/api-ts-types";

export type TCurrentBoard =
  | components["schemas"]["BoardItem"]
  | components["schemas"]["BoardPrivate"]
  | null;
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
