describe("Contexte", () => {
  context("Vue d'ensemble", () => {
    it("should acept evaluation", () => {
      cy.acceptEval();
      cy.closeValidationEvaluationModal();
    });
  });
  context("Données, processus et supports", () => {
    it("should acept evaluation", () => {
      cy.acceptEval();
      cy.closeValidationEvaluationModal();
    });
  });
});
