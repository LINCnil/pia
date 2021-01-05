describe("Contexte", () => {
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });

  context("prepare data", () => {
    it("create pia, set section 1, item 1 and 2", () => {
      cy.disable_onboarding();
      cy.create_new_pia().then(() => {
        cy.wait(500);
        cy.test_writing_on_textarea().then(() => {
          cy.wait(2000);
          cy.validateEval();
          cy.validateModal();
          cy.wait(2000);

          cy.test_writing_on_textarea();
          cy.validateEval();
          cy.validateModal();
          cy.wait(2000);
        });
      });
    });
  });

  context("Validation de vue d'ensemble", () => {
    it("should acept evaluation", () => {
      // GO BACK TO item 1 and validate it
      cy.disable_onboarding();
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 1, 1);
        cy.acceptEval();
        cy.closeValidationEvaluationModal();
      });
    });
  });

  context("Données, processus et supports", () => {
    it("should acept evaluation", () => {
      cy.acceptEval();
      cy.closeValidationEvaluationModal();
    });
  });
});
