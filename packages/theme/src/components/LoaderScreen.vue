<template>
  <div :class="$style.root">
    <img :class="$style.logo" src="/logchimp.svg" alt="LogChimp" />
    <div :class="$style.pulse" />
  </div>
</template>

<script setup lang="ts">

</script>

<style lang='scss' module>
.root {
  position: absolute;
  width: 100%;
  height: 100vh;
  background-color: var(--color-white);
  z-index: 1;
}

.logo {
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4rem;
  height: 4rem;
  z-index: 1;
}

.pulse {
  &:before,
  &:after {
    border-radius: 50%;
    content: "";
    width: 3rem;
    height: 3rem;
    background-color: var(--color-brand-color);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    transform: scale(0.5);
    transform-origin: center center;
    animation: pulse-me 3s linear infinite;
  }
  &:after {
    animation-delay: 2s;
  }
}

@keyframes pulse-me {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
  70% {
    opacity: 0.09;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
