export default async function ({ store, $axios }) {
	const { settings } = await $axios.$get(
		"http://localhost:3000/api/v1/settings/site"
	);

	store.dispatch("settings/update", settings);
}
