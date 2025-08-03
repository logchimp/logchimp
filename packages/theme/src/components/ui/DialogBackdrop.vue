<template>
  <div
    :class="[
      'fixed left-0 top-0 z-50 h-dvh w-screen opacity-0',
      'transition-[background-color,backdrop-filter]',
      'bg-black/20 backdrop-blur-sm pointer-events-none',
    ]"
    aria-hidden="true"
  />
</template>
