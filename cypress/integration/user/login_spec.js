describe("Login", () => {
	it("Visit login page", () => {
		cy.visit("/login");
	});

	it("Greet with 'Welcome back!'", () => {
		cy.get("[data-test=login-page-heading]").contains("Welcome back!");
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
			cy.get("[data-test=login-button]").click();
		});

		it("Email address is required", () => {
			cy.get("[data-test=email-input] .input-error-message").should(
				"contain",
				"Required"
			);
		});

		it("Password is required", () => {
			cy.get("[data-test=password-input] .input-error-message").should(
				"contain",
				"Required"
			);
		});
	});

	describe("User not found", () => {
		it("Enter email address", () => {
			cy.get("[data-test=email-input] input")
				.type("usernotfound@example.com")
				.should("have.value", "usernotfound@example.com");
		});

		it("Enter password", () => {
			cy.get("[data-test=password-input] input")
				.type("password{enter}")
				.should("have.value", "password");
		});

		it("Check 'user not found' error message", () => {
			cy.get("[data-test=email-input] .input-error-message").should(
				"contain",
				"User not found"
			);
		});
	});

	describe("Incorrect password", () => {
		it("Enter email address", () => {
			cy.get("[data-test=email-input] input")
				.type("{selectall}incorrectPassword@example.com")
				.should("have.value", "incorrectPassword@example.com");
		});

		it("Enter password", () => {
			cy.get("[data-test=password-input] input")
				.type("{selectall}sdfdsfsdfs{enter}")
				.should("have.value", "sdfdsfsdfs");
		});

		it("Check 'Incorrect password' error message", () => {
			cy.get("[data-test=password-input] .input-error-message").should(
				"contain",
				"Incorrect password"
			);
		});
	});

	describe("Login with existing user", () => {
		it("Enter email address", () => {
			cy.get("[data-test=email-input] input")
				.type("{selectall}email@example.com")
				.should("have.value", "email@example.com");
		});

		it("Enter password", () => {
			cy.get("[data-test=password-input] input")
				.type("{selectall}password{enter}")
				.should("have.value", "password");
		});
	});
});
