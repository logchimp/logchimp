<template>
  <div class="breadcrumbs">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="breadcrumbs"
    >
      <router-link
        v-if="item.href"
        :to="item.href"
        class="breadcrum-item"
      >
        {{ item.text }}
      </router-link>
      <div v-else class="breadcrum-item">
        {{ item.text }}
      </div>
      <div v-if="lastItem" class="breadcrum-divider">
        /
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Breadcrumbs",
  props: {
    items: {
      type: Array,
      required: true
    }
  }
};
</script>
