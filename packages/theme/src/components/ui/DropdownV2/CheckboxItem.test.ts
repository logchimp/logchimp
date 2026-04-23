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
  it("should prevent dropdown close [keepOpenOnShift=true, shift=pressed]", async () => {
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

  it("should not prevent dropdown close [keepOpenOnShift=false, shift=pressed]", async () => {
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

  it("should prevent dropdown close on Enter key selection when [keepOpenOnShift=true, shift=pressed]", async () => {
    const wrapper = shallowMount(CheckboxItem, {
      props: {
        keepOpenOnShift: true,
      },
    });

    await wrapper.trigger("keydown", { key: "Enter", shiftKey: true });
    const event = createCancelableSelectEvent();
    triggerSelectOnStub(wrapper, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("should use latest pointer modifier state at selection time", async () => {
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
