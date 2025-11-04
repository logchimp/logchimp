<template>
  <router-link
    v-if="showBoard"
    data-test="board-badge"
    class="board-badge"
    :to="`/boards/${url}`"
  >
    <div class="post-board">
      <div
        class="color-dot"
        data-test="board-badge-color"
        :style="{
          backgroundColor: `#${color}`
        }"
      />
      <p class="post-board-name" data-test="board-badge-name">
        {{ name }}
      </p>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "BoardBadge",
  props: {
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true,
      validator: value => {
        return value.length === 6;
      }
    },
    url: {
      type: String,
      required: true
    },
    showBoard: {
      type: Boolean,
      required: true
    }
  }
};
</script>
