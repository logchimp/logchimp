import database from "../../database";

export const cleanDb = async () => {
  await database.from("posts_activity").del();
  await database.from("posts_comments").del();
  await database.from("votes").del();
  await database.from("posts").del();
  await database.from("users").del();
};
