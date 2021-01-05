describe("Contexte", () => {
  /**
   * initialization
   */
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });

  context("Vue d'ensemble", () => {
    /**
     * Complete textareas
     */
    it("Create a new pia and should complete textareas", () => {
      //cy.disable_onboarding();
      cy.create_new_pia().then(() => {
        cy.test_writing_on_textarea();
      });
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
