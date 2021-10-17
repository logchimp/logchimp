export default async function ({ store, $http }) {
	const { settings } = await $http.$get(
		"http://localhost:3000/api/v1/settings/site"
	);

	store.dispatch("settings/update", settings);
}
