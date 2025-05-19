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
    it("Go on serveur URL configuration and set var and save", () => {
      cy.visit("/");
      cy.get(".pia-navigationBlock-dropdown")
        .eq(0)
        .trigger("mouseover");
      cy.wait(500);
      cy.get(".ng-untouched fieldset a")
        .eq(0)
        .click({ force: true });
      cy.wait(500);

      cy.get("#server_url").type(Cypress.env("URL"));
      cy.get("#client_id").type(Cypress.env("ID"));
      cy.get("#client_secret").type(Cypress.env("SECRET"));
      cy.get(".btn-green").click();
      cy.wait(500);
      cy.get(".pia-modalBlock-buttons-choice button[type=button]").click();
      cy.url().should("include", "/");
    });
  });
});
