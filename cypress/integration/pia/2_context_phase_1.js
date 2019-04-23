describe("Contexte", () => {
  context("Vue d'ensemble", () => {
    it("should complete textareas", () => {
      cy.test_writing_on_textarea()
    });
    it("should valid evaluation", () => {
      cy.validateEval()
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal()
    });
  });
  context("Données, processus et supports", () => {
    it("should complete textareas", () => {
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval()
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal()
    });
  });
});
