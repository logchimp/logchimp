import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import database from "../../../src/database";
import { nanoid } from "nanoid";
import { generateHexColor, sanitiseURL } from "../../../src/helpers";

export async function createBoard() {
  const name = faker.commerce.productName();

  const boardId = uuid();
  const url = `${sanitiseURL(name)}-${nanoid(10)}`;
  const color = generateHexColor();
  const display = faker.datatype.boolean();
  const view_voters = faker.datatype.boolean();
  const createdAt = new Date().toJSON();
  const updatedAt = new Date().toJSON();

  const board = {
    boardId,
    name,
    url,
    color,
    display,
    view_voters,
    createdAt,
    updatedAt,
  };

  await database.insert(board).into("boards");

  return board;
}
