import { faker } from "@faker-js/faker";
import { v4 as uuidv4, v4 as uuid } from "uuid";
import generatePassword from "omgopass";

import {
  generateHexColor,
  sanitiseUsername,
  sanitiseURL,
  toSlug,
  generateNanoID as nanoid,
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
  const url = roadmap?.url || `${sanitiseURL(name)}-${nanoid(10)}`;
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

interface PostArgs {
  title?: string;
  contentMarkdown?: string;
  userId: string;
  boardId?: string;
  roadmapId?: string;
}

const post = async (post: PostArgs, insertToDb = false) => {
  const title = faker.commerce.productName();
  const contentMarkdown = post?.contentMarkdown || faker.lorem.text();

  // generate slug unique identification
  const slugId = nanoid(20);
  const slug = `${toSlug(title)}-${slugId}`;

  const obj = {
    postId: uuid(),
    title,
    slug: slug,
    slugId: slugId,
    contentMarkdown,
    userId: post.userId,
    boardId: post?.boardId,
    roadmap_id: post?.roadmapId,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  };

  if (insertToDb) {
    await database.insert(obj).into("posts");
  }

  return obj;
};

interface BoardArgs {
  name: string;
  url: string;
  display: boolean;
  view_voters: boolean;
  color: string;
}

export interface BoardInsertRecord {
  boardId: string;
  name: string;
  url: string;
  color: string;
  display: boolean;
  view_voters: boolean;
  createdAt: string;
  updatedAt: string;
}

const board = async (
  board?: Partial<BoardArgs>,
  insertToDb = false,
): Promise<BoardInsertRecord> => {
  const name = board?.name || faker.commerce.productName();

  const obj: BoardInsertRecord = {
    boardId: uuid(),
    name,
    url: board?.url || `${sanitiseURL(name)}-${nanoid(10)}`,
    color: board?.color || generateHexColor(),
    display: board?.display || faker.datatype.boolean(),
    view_voters: board?.view_voters || faker.datatype.boolean(),
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  };

  if (insertToDb) {
    await database.insert(obj).into("boards");
  }

  return obj;
};

interface RoleArgs {
  name: string;
  description: string;
}

async function role(role?: Partial<RoleArgs>) {
  const name = role?.name || faker.commerce.productName();

  const obj = {
    id: uuid(),
    name,
    description: role?.description,
    created_at: new Date().toJSON(),
    updated_at: new Date().toJSON(),
  };

  await database.insert(obj).into("roles");

  return obj;
}

async function vote(userId: string, postId: string) {
  await database
    .insert({
      voteId: uuidv4(),
      userId,
      postId,
    })
    .into("votes");
}

export { user, roadmap, post, board, role, vote };
