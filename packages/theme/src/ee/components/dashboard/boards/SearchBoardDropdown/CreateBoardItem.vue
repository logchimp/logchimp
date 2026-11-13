<template>
  <DropdownMenuItem
    :class="[
      'w-full text-left text-neutral-700 hover:bg-neutral-300/50',
      'cursor-pointer outline-none',
      'flex items-center gap-x-4 px-4 py-3',
    ]"
    text-value=""
    @click="createBoardHandler"
    @select="(e: Event) => e.preventDefault()"
  >
    <PlusIcon class="size-4" aria-hidden="true" />
    Create "{{ search }}"
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DropdownMenuItem } from "reka-ui";
import { PlusIcon } from "lucide-vue";
import type { components } from "@logchimp/api-ts-types";
import type { AxiosError } from "axios";

import { useAlertStore } from "../../../../../store/alert.ts";
import { BoardsEE } from "../../../../modules/boards";

interface Props {
  search: string;
}
const props = defineProps<Props>();
const emit =
  defineEmits<
    (e: "created", event: components["schemas"]["BoardPrivate"]) => void
  >();

const { add: toast } = useAlertStore();
const loading = ref(false);
const boardsEEAPI = new BoardsEE();

async function createBoardHandler() {
  if (loading.value) return;
  loading.value = true;

  try {
    const response = await boardsEEAPI.CreateBoard({
      name: props.search,
    });
    const board = response.board;

    emit("created", board);
  } catch (error) {
    const err = error as AxiosError<
      components["schemas"]["GenericAPIErrorResponseBody"]
    >;

    toast({
      title: err.response?.data.message ?? "Failed to create board",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>
