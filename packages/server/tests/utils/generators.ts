import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import generatePassword from "omgopass";
import { nanoid } from "nanoid";
import {
  generateHexColor,
  sanitiseUsername,
  sanitiseURL,
  toSlug,
} from "../../src/helpers";

interface PostGeneratorConfig {
  user_id: string;
  board_id: string;
  roadmap_id: string;
}

const user = () => {
  return {
    userId: uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: generatePassword(),
    username: sanitiseUsername(faker.internet.username()),
    avatar: faker.image.avatar(),
    isVerified: faker.datatype.boolean(),
    isOwner: faker.datatype.boolean(),
    isBlocked: faker.datatype.boolean(),
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  };
};

const roadmap = () => {
  const name = faker.commerce.productName();
  const url = name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .substring(0, 50)
  .replace(/^-+|-+$/g, "");

  return {
    id: uuid(),
    name,
    url,
    index: faker.number.int({ min: 1, max: 100000 }),
    color: generateHexColor(),
    display: faker.datatype.boolean(),
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON(),
  };
};

const post = ({ user_id, board_id, roadmap_id }: PostGeneratorConfig) => {
  const title = faker.commerce.productName();

  // generate slug unique indentification
  const slugId = nanoid(20);
  const slug = `${toSlug(title)}-${slugId}`;

  return {
    postId: uuid(),
    title,
    slug,
    slugId,
    contentMarkdown: faker.lorem.text(),
    userId: user_id,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
    boardId: board_id,
    roadmap_id: roadmap_id,
  };
};

const board = () => {
  const name = faker.commerce.productName();

  return {
    boardId: uuid(),
    name,
    url: `${sanitiseURL(name)}-${nanoid(10)}`,
    color: generateHexColor(),
    display: faker.datatype.boolean(),
    view_voters: faker.datatype.boolean(),
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  };
};

export { user, roadmap, post, board };
