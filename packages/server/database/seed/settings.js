/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("settings").del();
  await knex("settings").insert([
    {
      title: "LogChimp",
      description: "Track user feedback to build better products",
      accentColor: "484d7c",
      logo: "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png",
      icon: "https://cdn.logchimp.codecarrot.net/logchimp_circular_logo.png",
      isPoweredBy: true,
    },
  ]);
};
