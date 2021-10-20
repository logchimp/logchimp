import ToggleItem from "../../src/components/input/ToggleItem";
import { shallowMount } from "@vue/test-utils";

describe("toggle item", () => {
  const wrapper = shallowMount(ToggleItem, {
    propsData: {
      label: "ToggleItem Label"
    }
  });

  it("has label", () => {
    expect(wrapper.find("[data-test=toggle-item-label").text()).toBe(
      "ToggleItem Label"
    );
  });

  it("note doesn't exists", () => {
    expect(wrapper.find("[data-test=toggle-item-note]").exists()).toBe(false);
  });

  it("has note", async () => {
    await wrapper.setProps({
      note: "This is note section"
    });

    expect(wrapper.find("[data-test=toggle-item-note]").text()).toBe(
      "This is note section"
    );
  });
});
