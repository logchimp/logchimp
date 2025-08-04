import { mount } from "@vue/test-utils";

import PageHeader from "./PageHeader.vue";

describe("PageHeader", () => {
  describe("rendering", () => {
    it("renders with title", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Dashboard Overview",
        },
      });

      expect(wrapper.find("[data-test=page-header]").exists()).toBe(true);
      expect(wrapper.find("[data-test=page-header-title]").text()).toBe(
        "Dashboard Overview",
      );
    });

    it("renders with description", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Users",
          description: "Manage your users and their permissions",
        },
      });

      expect(wrapper.find("[data-test=page-header-description]").text()).toBe(
        "Manage your users and their permissions",
      );
    });

    it("renders with breadcrumbs", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Settings",
          breadcrumbs: ["Dashboard", "Settings", "General"],
        },
      });

      expect(wrapper.find("[data-test=page-header-breadcrumbs]").exists()).toBe(
        true,
      );
      const breadcrumbItems = wrapper.findAll(
        "[data-test=page-header-breadcrumb]",
      );
      expect(breadcrumbItems).toHaveLength(3);
      expect(breadcrumbItems[0].text()).toBe("Dashboard");
      expect(breadcrumbItems[1].text()).toBe("Settings");
      expect(breadcrumbItems[2].text()).toBe("General");
    });

    it("renders with actions slot", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Posts",
        },
        slots: {
          actions: '<button data-test="action-button">Create Post</button>',
        },
      });

      expect(wrapper.find("[data-test=page-header-actions]").exists()).toBe(
        true,
      );
      expect(wrapper.find("[data-test=action-button]").text()).toBe(
        "Create Post",
      );
    });
  });

  describe("conditional rendering", () => {
    it("does not render title when not provided", () => {
      const wrapper = mount(PageHeader, {
        props: {},
      });

      expect(wrapper.find("[data-test=page-header-title]").exists()).toBe(
        false,
      );
    });

    it("does not render description when not provided", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
        },
      });

      expect(wrapper.find("[data-test=page-header-description]").exists()).toBe(
        false,
      );
    });

    it("does not render breadcrumbs when not provided", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
        },
      });

      expect(wrapper.find("[data-test=page-header-breadcrumbs]").exists()).toBe(
        false,
      );
    });

    it("does not render actions when slot is not provided", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
        },
      });

      expect(wrapper.find("[data-test=page-header-actions]").exists()).toBe(
        false,
      );
    });
  });

  describe("props validation", () => {
    it("accepts title prop", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test Title",
        },
      });

      expect(wrapper.props("title")).toBe("Test Title");
    });

    it("accepts description prop", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
          description: "Test Description",
        },
      });

      expect(wrapper.props("description")).toBe("Test Description");
    });

    it("accepts breadcrumbs prop", () => {
      const breadcrumbs = ["Home", "Dashboard", "Users"];
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
          breadcrumbs,
        },
      });

      expect(wrapper.props("breadcrumbs")).toEqual(breadcrumbs);
    });
  });

  describe("complex scenarios", () => {
    it("renders all elements together", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "User Management",
          description: "View and manage all users in your system",
          breadcrumbs: ["Dashboard", "Users"],
        },
        slots: {
          actions: `
            <button data-test="add-user">Add User</button>
            <button data-test="export-users">Export</button>
          `,
        },
      });

      // Check all elements are present
      expect(wrapper.find("[data-test=page-header-title]").text()).toBe(
        "User Management",
      );
      expect(wrapper.find("[data-test=page-header-description]").text()).toBe(
        "View and manage all users in your system",
      );
      expect(wrapper.find("[data-test=page-header-breadcrumbs]").exists()).toBe(
        true,
      );
      expect(wrapper.find("[data-test=page-header-actions]").exists()).toBe(
        true,
      );
      expect(wrapper.find("[data-test=add-user]").exists()).toBe(true);
      expect(wrapper.find("[data-test=export-users]").exists()).toBe(true);
    });

    it("handles empty breadcrumbs array", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
          breadcrumbs: [],
        },
      });

      expect(wrapper.find("[data-test=page-header-breadcrumbs]").exists()).toBe(
        false,
      );
    });

    it("handles single breadcrumb", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
          breadcrumbs: ["Dashboard"],
        },
      });

      const breadcrumbItems = wrapper.findAll(
        "[data-test=page-header-breadcrumb]",
      );
      expect(breadcrumbItems).toHaveLength(1);
      expect(breadcrumbItems[0].text()).toBe("Dashboard");
    });
  });

  describe("accessibility", () => {
    it("has proper heading structure", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Dashboard",
        },
      });

      const title = wrapper.find("[data-test=page-header-title]");
      expect(title.element.tagName).toBe("H1");
    });

    it("has proper breadcrumb structure", () => {
      const wrapper = mount(PageHeader, {
        props: {
          title: "Test",
          breadcrumbs: ["Dashboard", "Settings"],
        },
      });

      const breadcrumbItems = wrapper.findAll(
        "[data-test=page-header-breadcrumb]",
      );
      breadcrumbItems.forEach((item) => {
        expect(item.element.tagName).toBe("H5");
      });
    });
  });
});
