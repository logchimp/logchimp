import { expect, type Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import type {
  IAuthSignupResponseBody,
  ICreatePostResponseBody,
  IGetPostBySlugResponseBody,
} from "@logchimp/types";

import { test } from "../../fixtures/pageTest";
import { createPost, userSignup } from "../../helpers/api";

const POST_BY_SLUG_API = "**/api/v1/posts/slug";

type PostResponseBody = IGetPostBySlugResponseBody["post"];

function buildPost(
  overrides: Partial<PostResponseBody> = {},
): PostResponseBody {
  return {
    postId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    slug: `${faker.lorem.slug()}-${faker.string.alphanumeric(10)}`,
    slugId: faker.string.alphanumeric(20),
    contentMarkdown: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      userId: faker.string.uuid(),
      name: faker.person.fullName(),
      username: faker.internet.username(),
      avatar: null,
    },
    board: null,
    roadmap: null,
    voters: {
      votes: [],
      votesCount: 0,
    },
    ...overrides,
  };
}

/**
 * Intercept the `POST /api/v1/posts/slug` request so the page renders a
 * deterministic post. This keeps the roadmap & board assertions independent
 * from an Enterprise Edition license, which the e2e stack does not run with.
 */
async function mockPostBySlug(
  page: Page,
  body: unknown,
  status = 200,
): Promise<void> {
  await page.route(POST_BY_SLUG_API, (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(body),
    }),
  );
}

test.describe("Post view", () => {
  test.describe("Post content", () => {
    test("should render a post created through the API", async ({
      page,
      request,
      baseURL,
    }) => {
      const signupResponse = await userSignup({
        requestContext: request,
        baseURL,
      });
      expect(signupResponse.ok()).toBeTruthy();
      const { user } = (await signupResponse.json()) as IAuthSignupResponseBody;

      const createResponse = await createPost({
        requestContext: request,
        baseURL,
        authToken: user.authToken,
      });
      expect(createResponse.status()).toBe(201);
      const { post } = (await createResponse.json()) as ICreatePostResponseBody;

      await page.goto(`/posts/${encodeURIComponent(post.slug)}`);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        post.title,
      );

      const authorName = user.name || user.username;
      await expect(page.getByText(authorName)).toBeVisible();

      // The post author is automatically added as the first voter
      await expect(page.locator('[data-test="vote-count"]')).toHaveText("1");

      await expect(
        page.getByText(post.contentMarkdown as string),
      ).toBeVisible();
    });

    test("should display a message when the post does not exist", async ({
      page,
    }) => {
      await page.goto(`/posts/${faker.string.alphanumeric(24)}`);

      await expect(page.getByText("There is no such post.")).toBeVisible();
    });
  });

  test.describe("Roadmap & board", () => {
    test("should display the roadmap name and color", async ({ page }) => {
      const roadmap = {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        url: faker.lorem.slug(),
        color: "ff0000",
      };
      const post = buildPost({ roadmap });

      await mockPostBySlug(page, { post });
      await page.goto(`/posts/${encodeURIComponent(post.slug)}`);

      const roadmapName = page.getByText(roadmap.name, { exact: true });
      await expect(roadmapName).toBeVisible();
      await expect(roadmapName).toHaveCSS("color", "rgb(255, 0, 0)");
    });

    test("should display the board badge linking to the board", async ({
      page,
    }) => {
      const board = {
        boardId: faker.string.uuid(),
        name: faker.commerce.department(),
        url: faker.lorem.slug(),
        color: "00ff00",
        createdAt: new Date(),
      };
      const post = buildPost({ board });

      await mockPostBySlug(page, { post });
      await page.goto(`/posts/${encodeURIComponent(post.slug)}`);

      const boardBadge = page.locator('[data-test="board-badge"]');
      await expect(boardBadge).toBeVisible();
      await expect(boardBadge).toHaveAttribute(
        "href",
        `/boards/${encodeURIComponent(board.url)}`,
      );

      await expect(page.locator('[data-test="board-badge-name"]')).toHaveText(
        board.name,
      );
    });

    test("should not display roadmap or board when the post has none", async ({
      page,
    }) => {
      const post = buildPost();

      await mockPostBySlug(page, { post });
      await page.goto(`/posts/${encodeURIComponent(post.slug)}`);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        post.title,
      );
      await expect(page.locator('[data-test="board-badge"]')).toHaveCount(0);
      // The roadmap label is the only uppercase paragraph on the page
      await expect(page.locator("p.uppercase")).toHaveCount(0);
    });
  });
});
