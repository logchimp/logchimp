import { mount } from "@vue/test-utils";

import Toggle from "./Toggle.vue";

describe("toggle", () => {
  const wrapper = mount(Toggle);

  it("unchecked with gray color", () => {
    expect(wrapper.find("[data-test=toggle]").attributes("style")).toBe(
      "background-color: rgb(153, 153, 153);",
    );
  });

  // todo: error: Cannot read property '0' of undefined
  // it("emit checkbox value", async () => {
  // 	const checkbox = wrapper.find("[data-test=toggle-checkbox]");
  // 	await checkbox.trigger("click");

  // 	const value = wrapper.emitted("input");
  // 	expect(value[0][0]).toBe(true);
  // });
});
