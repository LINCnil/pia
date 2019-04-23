describe("Test Search KnowledgeBase", () => {
  context("Search Form", () => {
    it("should search an element", () => {
      const url = "http://localhost:4200/#/entry/3/section/2/item/2";
      cy.visit(url);
      cy.get(".pia-knowledgeBaseBlock-searchForm").find("input").type("Transf");
      cy.get(".pia-knowledgeBaseBlock-searchForm").find("button").click()
    });
  });
  context("Refuse or ask pia signature", () => {
    it("should refuse pia", () => {
      cy.validatePia();
      cy.get('.btn-red').first().click();
      cy.get(".pia-entryContentBlock-content-subject-textarea").find("textarea").type("Le pia n'est pas en accord avec nos attentes");
      cy.get(".pia-entryContentBlock-content-subject-textarea").wait(500).click();
      cy.wait(500).get(".pia-entryContentBlock-footer").find("button").last().click();
      cy.get('#modal-refuse-pia > .pia-modalBlock-content > .pia-modalBlock-validate > .btn').click();
    });
  });
});
