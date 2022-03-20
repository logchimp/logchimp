import Post from "../../components/posts/PostItem";
import { shallowMount } from "@vue/test-utils";

describe("post", () => {
	const wrapper = shallowMount(Post, {
		propsData: {
			post: {
				// random UUID
				postId: "69136892-b8c8-41c7-9e8f-a2eb212e5311",
				title: "Post title",
				// random slug ID
				slug: "post-title-qwJy9_3Sm9g3Qm3r9OQk",
				contentMarkdown: "What's this feature is all about?",
				voters: {
					isVoted: true,
					voteCount: 120
				},
				board: {
					name: "Feature requests",
					color: "abcabc",
					url: "feature-requests",
					showBoard: true
				}
			}
		}
	});

	it("link to post", () => {
		const link = wrapper.find("a[data-test=post-link]").attributes("href");
		expect(link).toBe("/posts/post-title-qwJy9_3Sm9g3Qm3r9OQk");
	});

	it("title", () => {
		expect(wrapper.find("[data-test=post-link] h5").text()).toBe("Post title");
	});

	it("description", () => {
		expect(wrapper.find("[data-test=post-description]").text()).toBe(
			"What's this feature is all about?"
		);
	});
});
