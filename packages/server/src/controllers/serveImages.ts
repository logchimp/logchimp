// modules
import fs from "fs";
import path from "path";

/**
 * Following image formats are allowed (they're case sensitive):
 * - jpg
 * - jpeg
 * - png
 * - svg
 */
export function serveImages(req, res) {
  const imagePathRegex = /^\/(.+)(?:pn|jpe?|sv)g$/gim;
  const filterImagePath = req.url.match(imagePathRegex);

  if (filterImagePath === null) {
    return res.sendStatus(404);
  }

  fs.readFile(
    path.join(__dirname, "../../../content/images", filterImagePath[0]),
    (err, data) => {
      if (err) {
        res.sendStatus(404);
      }
      if (data) {
        res.writeHead(200);
        res.end(data);
      }
    },
  );
}
