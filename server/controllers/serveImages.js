// modules
const fs = require("fs");
const path = require("path");

const serveImages = (req, res) => {
	fs.readFile(
		path.join(__dirname, "../../content/images", req.url),
		(err, data) => {
			if (err) {
				res.sendStatus(404);
			}
			if (data) {
				res.writeHead(200);
				res.end(data);
			}
		}
	);
};

module.exports = serveImages;
