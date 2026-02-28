<script setup lang="ts">
import { h, useSlots } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

const props = defineProps<{
  asChild?: boolean;
  to?: RouteLocationRaw;
}>();

const slots = useSlots();

function renderContent() {
  const defaultSlot = slots.default?.();
  const defaultClasses = "font-semibold text-xl text-black";

  // Case 1: asChild — apply classes to direct child
  if (props.asChild && defaultSlot?.length === 1) {
    const vnode = defaultSlot[0];
    if (!vnode) {
      return h(
        "div",
        {
          class: defaultClasses,
        },
        defaultSlot,
      );
    }

    const existingClass = vnode.props?.class || "";
    const mergedClass = [defaultClasses, existingClass]
      .filter(Boolean)
      .join(" ");

    return h(
      // @ts-expect-error
      vnode.type,
      {
        ...vnode.props,
        class: mergedClass,
      },
      vnode.children,
    );
  }

  // Case 2: to prop provided — render <router-link>
  if (props.to) {
    return h(
      RouterLink,
      {
        to: props.to,
        class: defaultClasses,
      },
      {
        default: () => defaultSlot,
      },
    );
  }

  // Case 3: default wrapper
  return h(
    "div",
    {
      class: defaultClasses,
    },
    defaultSlot,
  );
}
</script>

<template>
  <component :is="renderContent()" />
</template>
