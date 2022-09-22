describe("Client-Server", () => {
  before(() => {
    // Clear data
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  /**
   * Go to Entries page  pia-navigationBlock-withsub pia-navigationBlock-dropdown
   */
  context("Start", () => {
    it("Go on serveur URL configuration", () => {
      cy.visit("/");
      cy.get(".pia-navigationBlock-dropdown")
        .eq(0)
        .trigger("mouseover");
      cy.wait(500);
      cy.get(".ng-untouched fieldset a")
        .eq(0)
        .click({ force: true });
      cy.wait(500);
    });
  });

  context("Write URL ID and SECRET", () => {
    it("Write URL", () => {
      cy.get("#server_url").type(Cypress.env("URL"));
    });
    it("Write ID", () => {
      cy.get("#client_id").type(Cypress.env("ID"));
    });
    it("Write SECRET", () => {
      cy.get("#client_secret").type(Cypress.env("SECRET"));
    });
  });

  context("Redirection", () => {
    it("Click on save", () => {
      cy.get(".btn-green").click();
      cy.wait(5000);
      cy.get("button[type=button]")
        .eq(1)
        .click();

      cy.url().should("include", "/");
    });

    it("Verify URL", () => {
      cy.url().should("include", "/");
    });
  });
});
