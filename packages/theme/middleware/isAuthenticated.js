export default function ({ store }) {
	if (!process.server) {
		const user = localStorage.getItem("user");

		if (user) {
			store.dispatch("user/login", JSON.parse(user));
			store.dispatch("user/updatePermissions");
		}
	}
}
