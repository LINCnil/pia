describe("Home", () => {
  /**
   * initialization
   */
  before(() => {
    // Clear data
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  context("landing", () => {
    it("load page", () => {
      cy.visit("/");
    });

    // ->
    it("click on start and check url", () => {
      cy.visit("/");
      cy.get(".btn-green").click();
      cy.url().should("include", "/entries");
    });
  });
});
