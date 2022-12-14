describe("Test Search KnowledgeBase", () => {
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

  context("Search Form", () => {
    it("should search an element", () => {
      cy.create_new_pia().then(() => {
        cy.visit("/#/pia/2/section/2/item/2");
        cy.get(".pia-knowledgeBaseBlock-searchForm")
          .find("input")
          .type("Transf");
        cy.get(".pia-knowledgeBaseBlock-searchForm")
          .find("button")
          .click();
      });
    });
  });
});
