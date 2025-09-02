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
import database from "../../src/database";

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

interface RoadmapArgs {
  name: string;
  url: string;
  index: number;
  color: string;
  display: boolean;
  created_at: Date;
  updated_at: Date;
}

async function roadmap(roadmap?: Partial<RoadmapArgs>, insertToDb = false) {
  const name = roadmap?.name || faker.commerce.productName();

  const id = uuid();
  const url =
    roadmap?.url || `${sanitiseURL(name)}-${nanoid(10).toLowerCase()}`;
  const index = faker.number.int({ min: 1, max: 100000 });
  const color = generateHexColor();
  const display = faker.datatype.boolean();
  const created_at = new Date().toJSON();
  const updated_at = new Date().toJSON();

  const obj = {
    id,
    name,
    url,
    index,
    color,
    display,
    created_at,
    updated_at,
  };

  if (insertToDb) {
    await database.insert(obj).into("roadmaps");
  }

  return obj;
}

const post = () => {
  const title = faker.commerce.productName();

  // generate slug unique identification
  const slugId = nanoid(20);
  const slug = `${toSlug(title)}-${slugId}`;

  return {
    postId: uuid(),
    title,
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
