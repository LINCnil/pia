describe("Risques", () => {
  context("Mesures existantes ou prévues", () => {
    it("should acept evaluation", () => {
      cy.acceptMultipleEval();
      cy.closeValidationEvaluationModal();
    });
  });
  context("Accès illégitime à des données", () => {
    it("should acept evaluation", () => {
      cy.acceptEval();
      cy.closeValidationEvaluationModal();
      cy.redirectMeasureOnAcceptation();
    });
  });
  context("Modification non désirées de données", () => {
    it("should acept evaluation", () => {
      cy.acceptEval();
      cy.closeValidationEvaluationModal();
    });
  });
  context("Disparition de données", () => {
    it("should acept evaluation", () => {
      cy.acceptEval();
      cy.closeCompletedValidationEvaluationModal();
    });
  });
  context("Vue d'ensemble des risques", () => {
    it("should close modal and redirect to context", () => {
      const url = "http://localhost:4200/#/entry/2/section/4/item/3";
      cy.visit(url);
    });
  });
});
