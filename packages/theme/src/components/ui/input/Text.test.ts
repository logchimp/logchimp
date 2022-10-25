import { mount } from "@vue/test-utils";

import LText from "./LText.vue";

describe("text input", () => {
  const wrapper = mount(LText);

  it("should not have label", () => {
    expect(wrapper.find("[data-test=input-field-label]").exists()).toBe(false);
  });

  it("should have label", async () => {
    await wrapper.setProps({
      label: "Input label",
    });

    expect(wrapper.find("[data-test=input-field-label]").text()).toBe(
      "Input label",
    );
  });

  it("Do not show any error message", () => {
    expect(wrapper.find("[data-test=input-error-message]").exists()).toBe(
      false,
    );
  });

  describe("Disable input", () => {
    const wrapper = mount(LText, {
      props: {
        disabled: true,
      },
    });

    it("Has 'input-field-disabled' class", () => {
      expect(
        wrapper.find("[data-test=input-field]").classes("input-field-disabled"),
      ).toBe(true);
    });

    it("Has 'disabled' attribute in input", () => {
      expect(
        wrapper.find("[data-test=input-field]").attributes("disabled"),
      ).toEqual("");
    });
  });

  describe("Error in input and message section", () => {
    const wrapper = mount(LText, {
      props: {
        error: {
          show: true,
        },
      },
    });

    it("Red color border on input", () => {
      expect(
        wrapper.find("[data-test=input-field]").classes("input-error"),
      ).toBe(true);
    });

    it("Show empty error message", () => {
      expect(wrapper.find("[data-test=input-error-message]").exists()).toBe(
        true,
      );
    });

    it("Check error with message", async () => {
      await wrapper.setProps({
        error: {
          show: true,
          message: "Some error message",
        },
      });

      expect(wrapper.find("[data-test=input-error-message]").text()).toBe(
        "Some error message",
      );
    });
  });
});
