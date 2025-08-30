import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import database from "../../../src/database";
import { nanoid } from "nanoid";
import { toSlug } from "../../../src/helpers";

export async function createPost(
  userId: string,
  boardId: string,
  roadmapId: string
) {
  const title = faker.commerce.productName();
  // generate slug unique indentification
  const slugId = nanoid(20);
  const slug = `${toSlug(title)}-${slugId}`;
  const postId = uuid();
  const contentMarkdown = faker.lorem.text();
  const createdAt = new Date().toJSON();
  const updatedAt = new Date().toJSON();

  const post = {
    postId,
    title,
    slug,
    slugId,
    contentMarkdown,
    userId,
    createdAt,
    updatedAt,
    boardId,
    roadmapId
  };

  await database.insert(post).into("posts");

  return post;
}
