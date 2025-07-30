import knex from "knex";
import { dbConfig as config } from "./config";

const database = knex({
  ...config,
});

export default database;
