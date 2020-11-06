Cypress.Commands.add("login", () => {
	cy.request({
		method: "POST",
		url: "http://localhost:8080/api/v1/auth/login",
		body: {
			emailAddress: "email@example.com",
			password: "password"
		}
	}).then(response => {
		window.localStorage.setItem("user", JSON.stringify(response.body.user));
	});
});
