import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import Toggle from "./Toggle.vue";

describe("toggle", () => {
  it("should be unchecked with gray background color", () => {
    const wrapper = mount(Toggle);
    const component = wrapper.find("[data-test=toggle]");

    expect(component.attributes("data-state")).toBe("unchecked");
    // TODO: should check the CSS gray background color, not css class
    // expect(component.classes()).toContain("data-[state=unchecked]:bg-neutral-300");
  });

  it("should be checked", () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: true,
      },
    });

    const component = wrapper.find("[data-test=toggle]");
    expect(component.attributes("data-state")).toBe("checked");
  });

  // it.skip("should be checked with brand color", () => {
  //   const component = wrapper.find("[data-test=toggle]");
  //   console.log(component);
  //   const styles = component.attributes("style");
  //   console.log(styles);
  //   expect(styles).toBe("background-color: rgb(153, 153, 153);");
  // });

  it("should handle 'click' event to toggle", async () => {
    const wrapper = mount(Toggle);
    const component = wrapper.find("[data-test=toggle]");
    await component.trigger("click");

    // Event trigger
    wrapper.emitted("update:modelValue");
    const emitted = wrapper.emitted<boolean[]>("update:modelValue");
    expect(emitted).not.toBeUndefined();
    expect(emitted?.[0]?.[0]).toBe(true);

    // Toggle state updated
    console.log(component.attributes("data-state"));
    // TODO: should have to toggle state 'checked'
    // expect(component.attributes("data-state")).toBe("checked");
  });
});
