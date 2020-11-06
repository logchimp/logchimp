describe("Login", () => {
	it("Visit login page", () => {
		cy.visit("/login");
	});

	it("Greet with 'Welcome back!'", () => {
		cy.get(".auth-form-header > .auth-form-heading").contains("Welcome back!");
	});

	describe("Auth form footer links", () => {
		it("Links to sign up page", () => {
			cy.contains("Sign up").should("have.attr", "href", "/join");
		});

		it("Links to forget password page", () => {
			cy.contains("Forget password?").should(
				"have.attr",
				"href",
				"/password-reset"
			);
		});
	});

	describe("'Required' error message", () => {
		it("Show input field error", () => {
			cy.contains("Login").click();
		});
	});

	describe("User not found", () => {
		it("Enter email address", () => {
			cy.get(".auth-form label[name='email'] input")
				.type("usernotfound@example.com")
				.should("have.value", "usernotfound@example.com");
		});

		it("Enter password", () => {
			cy.get(".auth-form label[name='password'] input").type("password{enter}");
		});

		it("Check 'user not found' error message", () => {
			cy.get(".auth-form label[name='email'] .input-error-message").should(
				"contain",
				"User not found"
			);
		});
	});

	describe("Incorrect password", () => {
		it("Enter email address", () => {
			cy.get(".auth-form label[name='email'] input")
				.type("{selectall}incorrectPassword@example.com")
				.should("have.value", "incorrectPassword@example.com");
		});

		it("Enter password", () => {
			cy.get(".auth-form label[name='password'] input").type(
				"{selectall}sdfdsfsdfs{enter}"
			);
		});

		it("Check 'Incorrect password' error message", () => {
			cy.get(".auth-form label[name='password'] .input-error-message").should(
				"contain",
				"Incorrect password"
			);
		});
	});

	describe("Login with existing user", () => {
		it("Enter email address", () => {
			cy.get(".auth-form label[name='email'] input")
				.type("{selectall}email@example.com")
				.should("have.value", "email@example.com");
		});

		it("Enter password", () => {
			cy.get(".auth-form label[name='password'] input").type(
				"{selectall}password{enter}"
			);
		});
	});
});
