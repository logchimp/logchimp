export default ({ app, store, $storage }) => {
	app.router.onReady(() => {
		const user = $storage.getLocalStorage("user");
		if (user) {
			store.dispatch("user/login", user);
		}
	});
};
