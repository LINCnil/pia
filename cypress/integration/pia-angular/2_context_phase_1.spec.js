describe("Contexte", () => {
  before(() => {
    cy.clear_index_dbs();
    cy.disable_onboarding();
  });
  context("Vue d'ensemble", () => {
    it("should complete textareas", () => {
      cy.disable_onboarding();
      cy.create_new_pia();
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
  context("Données, processus et supports", () => {
    it("should complete textareas", () => {
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
});
