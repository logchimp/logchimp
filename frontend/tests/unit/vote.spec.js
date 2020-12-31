import Vuex from "vuex";
import Vote from "../../src/components/post/Vote";
import { createLocalVue, mount } from "@vue/test-utils";

const localVue = createLocalVue();
localVue.use(Vuex);

const store = new Vuex.Store({
	state: {
		permissions: ["vote:create", "vote:destroy"]
	},
	getters: {
		"user/getPermissions": state => state.permissions
	}
});

describe("vote", () => {
	it("Disable vote without 'vote:create' permission", () => {
		const store = new Vuex.Store({
			state: {
				permissions: []
			},
			getters: {
				"user/getPermissions": state => state.permissions
			}
		});
		const wrapper = mount(Vote, {
			store,
			localVue,
			propsData: {
				// random UUID
				postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311"
			}
		});

		expect(
			wrapper.find("[data-test=vote]").classes("post-voters-disabled")
		).toBe(true);
	});

	it("Enable vote with 'vote:create' permission", () => {
		const wrapper = mount(Vote, {
			store,
			localVue,
			propsData: {
				// random UUID
				postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311"
			}
		});

		expect(
			wrapper.find("[data-test=vote]").classes("post-voters-disabled")
		).toBe(false);
	});

	it("Vote is voted", () => {
		const wrapper = mount(Vote, {
			store,
			localVue,
			propsData: {
				// random UUID
				postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
				isVoted: true
			}
		});

		expect(
			wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote")
		).toBe(true);
	});

	it("Vote is not voted", () => {
		const wrapper = mount(Vote, {
			store,
			localVue,
			propsData: {
				// random UUID
				postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
				isVoted: false
			}
		});

		expect(
			wrapper.find("[data-test=vote-arrow]").classes("post-voters-vote")
		).toBe(false);
	});

	it("Vote count is '120' votes", () => {
		const wrapper = mount(Vote, {
			store,
			localVue,
			propsData: {
				// random UUID
				postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
				votesCount: 120
			}
		});

		expect(wrapper.find("[data-test=vote-count]").text()).toBe("120");
	});
});
