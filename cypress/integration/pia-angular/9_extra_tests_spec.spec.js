describe("Test Search KnowledgeBase", () => {
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });
  context("Search Form", () => {
    it("should search an element", () => {
      const url = "http://localhost:4200/#/entry/2/section/2/item/2";
      cy.visit(url);
      cy.get(".pia-knowledgeBaseBlock-searchForm")
        .find("input")
        .type("Transf");
      cy.get(".pia-knowledgeBaseBlock-searchForm")
        .find("button")
        .click();
    });
  });
  context("Refuse or ask pia signature", () => {
    it("should refuse pia", () => {
      cy.refusePia();
    });
  });
});
