export default async function ({ store, redirect, $axios }) {
	try {
		// Check for site setup
		const setup = await $axios({
			method: "GET",
			url: "/api/v1/auth/setup"
		});
		if (!setup.data.is_setup) {
			redirect({
				path: "/setup"
			});
		}
	} catch (error) {
		console.error(error);

		redirect({
			path: "/"
		});
	}
}
