export default async function ({ store, $axios }) {
	if (!process.server) {
		// remove this code some point in future
		// a fail-safe to fix the issue on existing LogChimp sites
		localStorage.removeItem("settings");
	}

	const { settings } = await $axios.$get("/api/v1/settings/site");

	store.dispatch("settings/update", settings);
}
