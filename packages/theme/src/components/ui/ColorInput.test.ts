import { mount } from "@vue/test-utils";

import ColorInput from "./ColorInput.vue";

describe("color input", () => {
  it("should not show error message on mounted", () => {
    const wrapper = mount(ColorInput);
    expect(wrapper.find("[data-test=input-error-message]").exists()).toBe(
      false,
    );
  });

  it("should show color '#abcabc' in preview", async () => {
    const wrapper = mount(ColorInput);
    await wrapper.setProps({
      modelValue: "abcabc",
    });

    expect(wrapper.find("[data-test=color-preview]").attributes("style")).toBe(
      "background-color: rgb(171, 202, 188);",
    );
  });

  it("should show default white color as preview", async () => {
    const wrapper = mount(ColorInput);

    expect(wrapper.find("[data-test=color-preview]").attributes("style")).toBe(
      "background-color: rgb(255, 255, 255);",
    );
  });
});
