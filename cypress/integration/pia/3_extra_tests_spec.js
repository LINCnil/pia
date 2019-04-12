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
      validatePia();
      cy.get('.btn-red').first().click();
      cy.get(".pia-entryContentBlock-content-subject-textarea").find("textarea").type("Le pia n'est pas en accord avec nos attentes");
      cy.get("body").click();
      cy.wait(500).get(".pia-entryContentBlock-footer").find("button").last().click();
      cy.get('#modal-refuse-pia > .pia-modalBlock-content > .pia-modalBlock-validate > .btn').click();
    });
    it("should ask signature", () => {

    });
  });
});
function validatePia() {
  cy.get('.pia-validatePIABlock').find(".btn-green").should('have.class', 'btn-active').click();
  cy.wait(500).get(".pia-entryContentBlock-content-list-confirm").each(($el, $index, $list) => {
    cy.wrap($el).find("label").click();
  });
}

function closeModal() {
  cy
    .wait(500)
    .get("#validate-evaluation")
    .invoke("show")
    .find("button")
    .first()
    .click()
    .wait(500)
}
