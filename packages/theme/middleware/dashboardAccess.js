export default async function ({ store, redirect, $axios }) {
	try {
		// Is user logged in
		const user = store.getters["user/getUserId"];
		if (!user) {
			redirect({
				path: "/",
				query: { redirect: "/dashboard" }
			});
		}

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

		// Check user access to dashboard
		const token = store.getters["user/getAuthToken"];
		const response = await $axios({
			method: "GET",
			url: "/api/v1/users/dashboard",
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		// Redirect for not having access
		if (!response.data.access) {
			redirect({
				path: "/"
			});
		}
	} catch (error) {
		console.error(error);

		redirect({
			path: "/"
		});
	}
}
