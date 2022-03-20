export default async function ({ $axios, redirect }) {
	try {
		const response = await $axios({
			method: "GET",
			url: "/api/v1/auth/setup"
		});

		if (response.data.is_setup) {
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
