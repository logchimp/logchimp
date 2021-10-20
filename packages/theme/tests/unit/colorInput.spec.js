import ColorInput from "../../components/ui/ColorInput";
import { mount } from "@vue/test-utils";

describe("color input", () => {
  const wrapper = mount(ColorInput);

  it("error message should not be shown", () => {
    expect(wrapper.find("[data-test=input-error-message]").exists()).toBe(
      false
    );
  });
});
