import database from "../../src/database";

export const cleanDb = async () =>
  database.transaction(async (trx) => {
    await trx.from("posts_activity").del();
    await trx.from("posts_comments").del();
    await trx.from("votes").del();
    await trx.from("posts").del();
    await trx.from("roadmaps").del();
    await trx.from("boards").del();
    await trx.from("users").del();
  });
