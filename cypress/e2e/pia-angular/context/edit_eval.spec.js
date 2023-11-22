export function context_edit_eval() {
  describe("Contexte Edition / Evaluation", () => {
    /**
     * initialization
     */
    before(() => {
      cy.init();
    });

    beforeEach(() => {
      // Skip tutorial
      cy.disable_onboarding();
    });

    context("Vue d'ensemble", () => {
      /**
       * Complete textareas
       */
      it("Create a new pia and should complete textareas", () => {
        cy.create_new_pia().then(() => {
          cy.test_writing_on_textarea();
        });
      });

      it("should valid evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 1);
          cy.validateEval();
          cy.validateModal();
        });
      });
    });

    context("Données, processus et supports", () => {
      it("should complete textareas", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 2);
          cy.test_writing_on_textarea();
        });
      });

      it("should valid evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 2);
          cy.validateEval();
          cy.validateModal();
        });
      });
    });
  });
}

context_edit_eval();
