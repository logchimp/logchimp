import { describe, it, expect, beforeEach } from "vitest";
import { createPinia } from "pinia";
import { mount } from "@vue/test-utils";

import PageHeader from "./PageHeader.vue";
import { useDashboard } from "../../store/dashboard";

describe("dashboard page header", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
  });

  it("renders left/default/right slots", () => {
    const wrapper = mount(PageHeader, {
      global: {
        plugins: [pinia],
      },
      slots: {
        left: '<div data-test="slot-left">left content</div>',
        default: '<div data-test="slot-default">center content</div>',
        right: '<div data-test="slot-right">right content</div>',
      },
    });

    expect(wrapper.find('[data-test="slot-left"]').text()).toBe("left content");
    expect(wrapper.find('[data-test="slot-default"]').text()).toBe(
      "center content",
    );
    expect(wrapper.find('[data-test="slot-right"]').text()).toBe(
      "right content",
    );
  });

  it("toggles sidebar when toggle button is clicked", async () => {
    const wrapper = mount(PageHeader, {
      global: {
        plugins: [pinia],
      },
    });
    const dashboard = useDashboard();

    expect(dashboard.isSidebarOpen).toBe(false);

    await wrapper.find('[data-test="sidebar-toggle"]').trigger("click");
    expect(dashboard.isSidebarOpen).toBe(true);

    await wrapper.find('[data-test="sidebar-toggle"]').trigger("click");
    expect(dashboard.isSidebarOpen).toBe(false);
  });
});
