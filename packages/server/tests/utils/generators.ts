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

const user = () => {
  return {
    userId: uuid(),
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generatePassword(),
    username: sanitiseUsername(faker.internet.userName()),
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

  return {
    id: uuid(),
    name,
    url: `${sanitiseURL(name)}-${nanoid(10)}`,
    index: faker.datatype.number(),
    color: generateHexColor(),
    display: faker.datatype.boolean(),
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON(),
  };
};

const post = () => {
  const title = faker.name.title;

  // generate slug unique indentification
  const slugId = nanoid(20);
  const slug = `${toSlug(title)}-${slugId}`;

  return {
    postId: uuid(),
    title: faker.name.title(),
    slug: slug,
    slugId: slugId,
    contentMarkdown: faker.lorem.text,
    userId: uuid(),
    boardId: uuid(),
    roadmap_id: uuid(),
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  };
};

const board = () => {
  const name = faker.commerce.product();

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
