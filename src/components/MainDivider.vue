<script setup lang="ts">

</script>

<template>
  <div
      class="divider"
      role="separator"
      aria-orientation="horizontal"
  />
</template>

<style scoped>
.divider {
  --divider-edge: transparent;
  --divider-center: rgba(104, 119, 137, 0.3);

  width: 100%;
  height: 2px;
  margin-top: 10px;
  background: linear-gradient(
      90deg,
      var(--divider-edge) 0%,
      var(--divider-center) 50%,
      var(--divider-edge) 100%
  );
}

</style>