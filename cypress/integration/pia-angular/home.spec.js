describe("Home", () => {
  const endPoint = "http://localhost:4200";

  /**
   * initialization
   */
  before(() => {
    // Clear datas
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  context("landing", () => {
    it("load page", () => {
      cy.visit(endPoint);
    });

    // ->
    it("click on start", () => {
      cy.get(".btn-green").click();
    });

    // test l'url, verifier que ça soit bien /entries
    it("verify url", () => {
      cy.url().should("include", "/entries");
    });
  });
});
