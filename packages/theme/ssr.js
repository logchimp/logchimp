const path = require("path");
const { loadNuxt, build } = require("nuxt");

const isDev = process.env.NODE_ENV !== "production";

const ssr = async () => {
	// Get a ready to use Nuxt instance
	const nuxt = await loadNuxt({
		for: isDev ? "dev" : "start",
		configFile: path.join(__dirname, "nuxt.config.js"),
		configOverrides: {
			buildDir: path.join(__dirname, ".out")
		}
	});

	// Enable live build & reloading on dev
	if (isDev) {
		build(nuxt);
	}

	return nuxt;
};

module.exports = ssr;
