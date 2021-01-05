describe("Principes Fondamentaux", () => {
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });
  context("Proportionnalité et nécessité", () => {
    it("should acept evaluation", () => {
      cy.acceptMultipleEval();
      cy.closeValidationEvaluationModal();
    });
  });
  context("Mesures protectrices des droits", () => {
    it("should acept evaluation", () => {
      cy.acceptMultipleEval();
      cy.closeValidationEvaluationModal();
    });
  });
});
