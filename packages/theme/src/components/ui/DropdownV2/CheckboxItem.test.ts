import { describe, expect, it } from "vitest";
import { DropdownMenuCheckboxItem } from "reka-ui";
import { shallowMount } from "@vue/test-utils";

import CheckboxItem from "./CheckboxItem.vue";

function createCancelableSelectEvent() {
  return new Event("select", { cancelable: true });
}

function triggerSelectOnStub(
  wrapper: ReturnType<typeof shallowMount>,
  event: Event,
) {
  const stub = wrapper.findComponent(DropdownMenuCheckboxItem);
  stub.vm.$emit("select", event);
}

describe("DropdownV2CheckboxItem", () => {
  it("prevents dropdown close when keepOpenOnShift is enabled and shift is held (keyboard)", async () => {
    const wrapper = shallowMount(CheckboxItem, {
      props: {
        keepOpenOnShift: true,
      },
    });

    await wrapper.trigger("keydown", { shiftKey: true });
    const event = createCancelableSelectEvent();
    triggerSelectOnStub(wrapper, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent dropdown close when keepOpenOnShift is disabled", async () => {
    const wrapper = shallowMount(CheckboxItem, {
      props: {
        keepOpenOnShift: false,
      },
    });

    await wrapper.trigger("keydown", { shiftKey: true });
    const event = createCancelableSelectEvent();
    triggerSelectOnStub(wrapper, event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("uses latest pointer modifier state at selection time", async () => {
    const wrapper = shallowMount(CheckboxItem, {
      props: {
        keepOpenOnShift: true,
      },
    });

    await wrapper.trigger("pointerdown", { shiftKey: true });
    await wrapper.trigger("pointerup", { shiftKey: false });
    const event = createCancelableSelectEvent();
    triggerSelectOnStub(wrapper, event);

    expect(event.defaultPrevented).toBe(false);
  });
});
