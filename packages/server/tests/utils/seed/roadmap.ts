import { faker } from "@faker-js/faker";
import { v4 as uuid } from "uuid";
import database from "../../../src/database";
import { generateHexColor } from "../../../src/helpers";

export async function createRoadmap() {
  const name = faker.commerce.productName();
  const url = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .substring(0, 50)
    .replace(/^-+|-+$/g, "");
  const id = uuid();
  const index = faker.number.int({ min: 1, max: 100000 });
  const color = generateHexColor();
  const display = faker.datatype.boolean();
  const created_at = new Date().toJSON();
  const updated_at = new Date().toJSON();

  const roadmap = {
    id,
    name,
    url,
    index,
    color,
    display,
    created_at,
    updated_at
  };

  await database.insert(roadmap).into("roadmaps");

  return roadmap;
}
