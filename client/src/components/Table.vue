<template>
  <div class="table-container">
    <div class="table-header">
      <slot name="header" />
    </div>
    <div class="table-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "Table"
};
</script>
