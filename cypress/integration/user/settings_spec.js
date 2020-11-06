describe("User settings", () => {
	beforeEach(() => {
		cy.login();
		cy.visit("/settings");
	});

	it("Heading", () => {
		cy.get(".form-container h4.user-settings-heading").contains(
			"Account settings"
		);
	});

	describe("Update user settings", () => {
		it("Insert name", () => {
			cy.get("[data-test=firstname-input] input").type("{selectall}First name");
			cy.get("[data-test=lastname-input] input").type("{selectall}Last name");
			cy.get("[data-test=update-settings-button]").click();
		});

		it("Validate updated user settings", () => {
			cy.reload();
			cy.get("[data-test=firstname-input] input").should(
				"have.value",
				"First name"
			);
			cy.get("[data-test=lastname-input] input").should(
				"have.value",
				"Last name"
			);
		});
	});
});
