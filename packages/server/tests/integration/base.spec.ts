import { it, expect } from "vitest";
import app from "../../src/app";
import supertest from "supertest";

it("GET /api", async () => {
  const response = await supertest(app).get("/api");

  expect(response.headers["content-type"]).toBe("text/html");
  expect(response.status).toBe(200);
  expect(response.text).toBe("👍");
});

// test("POST /api", async () => {
// 	const response = await supertest(app).post("/api");

// 	expect(response.headers["content-type"]).toContain("application/json");
// 	expect(response.body.code).toBe("ROUTE_NOT_FOUND");
// });

// describe("Server images", () => {
//   test("should return 404 for readme.md file", async () => {
//     const response = await supertest(app).get("/content/images/readme.md");
//
//     expect(response.status).toBe(404);
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
//     expect(response.status).toBe(200);
//   });
// });
