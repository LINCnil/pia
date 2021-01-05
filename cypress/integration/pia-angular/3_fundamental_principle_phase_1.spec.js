describe("Principes fondamentaux", () => {
  /**
   * initialization
   */
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });

  context("Proportionnalité et nécessité", () => {
    /**
     * Complete textareas
     */
    it("create pia and should complete textareas", () => {
      cy.create_new_pia().then(() => {
        cy.test_writing_on_textarea();
      });
    });

    /**
     * Validate datas
     */
    it("should valid evaluation", () => {
      cy.validateEval();
    });

    /**
     * Close Popup
     */
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });

  context("Mesures protectrices des droits", () => {
    /**
     * Complete textareas
     */
    it("should complete textareas", () => {
      cy.test_writing_on_textarea();
    });

    /**
     * Validate datas
     */
    it("should valid evaluation", () => {
      cy.validateEval();
    });

    /**
     * Close Popup
     */
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
});
