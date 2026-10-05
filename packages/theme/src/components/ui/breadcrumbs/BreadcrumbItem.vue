<script setup lang="ts">
import { h, useSlots, useAttrs } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

const props = defineProps<{
  asChild?: boolean;
  to?: RouteLocationRaw;
}>();

const slots = useSlots();
const attrs = useAttrs();

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

    const existingClass = (vnode.props as any)?.class || "";
    const mergedClass = [defaultClasses, existingClass, (attrs as any).class]
      .filter(Boolean)
      .join(" ");

    return h(
      // @ts-expect-error
      vnode.type,
      {
        ...(vnode.props as any),
        ...attrs,
        class: mergedClass,
      },
      (vnode as any).children,
    );
  }

  // Case 2: to prop provided — render <router-link>
  if (props.to) {
    return h(
      RouterLink,
      {
        to: props.to,
        ...attrs,
        class: [defaultClasses, (attrs as any).class].filter(Boolean).join(" "),
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
      ...attrs,
      class: [defaultClasses, (attrs as any).class].filter(Boolean).join(" "),
    },
    defaultSlot,
  );
}
</script>

<template>
  <component :is="renderContent()" />
</template>