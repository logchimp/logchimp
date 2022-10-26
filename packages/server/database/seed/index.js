const knex = require("..");

const settings = require("./settings.js");
const users = require("./users.js");

async function seedData() {
  // console.log('All tables are empty 🗑️')
  await knex("settings").insert(settings);
  await knex("users").insert(users);
}

seedData()
  .then(() => {
    console.log("🌱 Database seeded");
  })
  .catch(() => {
    console.log("Something went wrong!");
  })
  .finally(() => process.exit(1));
