import context_edit_eval from "./edit_eval.spec";

export function context_validation() {
  describe("Contexte Validation", () => {
    beforeEach(() => {
      // Skip tutorial
      cy.disable_onboarding();
    });

    context("Validation for 'Vue d'ensemble'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 1);
          cy.acceptEval();
          cy.closeValidationEvaluationModal();
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 1);
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });

    context("Validation for 'Données, processus et supports'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 2);
          cy.acceptEval();
          cy.closeValidationEvaluationModal();
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 1, 2);
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });
  });
}
context_validation();
