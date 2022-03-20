export default async function ({ store, $axios }) {
	if (!process.server) {
		const user = localStorage.getItem("user");

		if (user) {
			store.dispatch("user/login", JSON.parse(user));

			const token = store.getters["user/getAuthToken"];
			const response = await $axios({
				method: "GET",
				url: "/api/v1/users/permissions",
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			store.commit("user/setPermissions", response.data);
		}
	}
}
