<template>
  <div class="avatar" @click="$emit('click')">
    <div
      v-if="src"
      data-test="avatar-image"
      class="avatar-image"
    >
      <img
        :src="src"
        :alt="name"
        class="avatar-image-img"
      >
    </div>
    <div
      v-else
      data-test="avatar-initials"
      class="avatar-initials"
    >
      {{ initals }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Avatar",
  props: {
    src: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    initals() {
      return this.name.slice(0, 1);
    }
  }
};
</script>
