<template>
  <div
    :class="[
      'flex-1',
      {
        'flex items-center': loading || errorCode
      }
    ]"
  >
    <LoaderContainer v-if="loading" />
    <BoardEditor
      v-else-if="board.boardId && !errorCode"
      :title="title"
      :board="board"
    />
    <Dashboard404 v-else-if="errorCode === 'BOARD_NOT_FOUND'">
      Board not found
    </Dashboard404>
    <Dashboard500 v-else>
      Something went wrong.
    </Dashboard500>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import type { IBoardPrivate } from "@logchimp/types";

// modules
import { router } from "../../../../router";
import { getBoardByUrl } from "../../../modules/boards";

// components
import Dashboard404 from "../../../../components/dashboard/404.vue";
import Dashboard500 from "../../../../components/dashboard/500.vue";
import LoaderContainer from "../../../../components/ui/LoaderContainer.vue";
import BoardEditor from "../../../components/boards/BoardEditor.vue";

const errorCode = ref<string | undefined>();
const loading = ref<boolean>(false);
const title = ref<string>("");
const board = reactive<IBoardPrivate>({
  boardId: "",
  name: "",
  url: "",
  color: "",
  view_voters: false,
  display: false,
  createdAt: new Date(),
  post_count: "",
});

async function getBoard(url: string) {
  loading.value = true;
  errorCode.value = undefined;

  try {
    const response = await getBoardByUrl(url);

    title.value = response.data.board.name;
    Object.assign(board, response.data.board);
  } catch (err) {
    console.error(err);
    // @ts-expect-error
    errorCode.value = err.response.data.code;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const route = router.currentRoute.value;
  const urlParam = (route.params.url || "").toString();
  if (urlParam) {
    getBoard(urlParam);
  } else {
    router.push("/dashboard/boards");
  }
});

useHead({
  title: () => `${board.name ? `${board.name} • ` : ""}Board • Dashboard`,
});

defineOptions({
  name: "BoardSettings",
});
</script>
