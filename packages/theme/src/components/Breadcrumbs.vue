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

<script lang="ts">
interface BreadcrumbItemType {
	href?: string
	text: string
}
</script>

<script setup lang="ts">
defineProps<{
	items: BreadcrumbItemType[]
	lastItem?: boolean
}>()
</script>
