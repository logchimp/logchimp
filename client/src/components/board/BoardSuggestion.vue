<template>
  <div class="board-suggestion" @click="$emit('click')">
    <div
      class="color-dot"
      data-test="board-suggestion-color"
      :style="{
        backgroundColor: `#${board.color}`
      }"
    />
    <div class="board-suggestion-content">
      <h5 data-test="board-suggestion-name">
        {{ board.name }}
      </h5>
      <span data-test="board-suggestion-url">{{ board.url }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "BoardSuggestion",
  props: {
    board: {
      type: Object,
      default: () => {}
    }
  }
};
</script>
