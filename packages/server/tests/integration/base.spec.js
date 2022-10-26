import { it, expect } from "vitest";
const app = require("../../app");
const supertest = require("supertest");

it("GET /api", async () => {
  const response = await supertest(app).get("/api");

  expect(response.headers["content-type"]).toContain("text/html");
  expect(response.status).toEqual(200);
  expect(response.text).toBe("👍");
});

// test("POST /api", async () => {
// 	const response = await supertest(app).post("/api");

// 	expect(response.headers["content-type"]).toContain("application/json");
// 	expect(response.body.code).toEqual("ROUTE_NOT_FOUND");
// });

// describe("Server images", () => {
//   test("should return 404 for readme.md file", async () => {
//     const response = await supertest(app).get("/content/images/readme.md");
//
//     expect(response.status).toEqual(404);
//   });
//
//   test("should server 'png' image", async () => {
//     // generate ramdom image
//     const generateAvatar = new avatarGenerator({
//       imageExtension: ".png",
//     });
//
//     // Directory path for "content/image" directory
//     const contentImageDirectoryPath = path.join(
//       __dirname,
//       "../../../../content/images",
//     );
//     const randomAvatarImage = await generateAvatar.generate(
//       "contact@codecarrot.net",
//       "male",
//     );
//
//     console.log(contentImageDirectoryPath);
//
//     await randomAvatarImage
//       .png()
//       .pipe(
//         fs.createWriteStream(`${contentImageDirectoryPath}/random-avatar.png`),
//       );
//
//     const response = await supertest(app).get(
//       "/content/images/random-avatar.png",
//     );
//
//     expect(response.status).toEqual(200);
//   });
// });
