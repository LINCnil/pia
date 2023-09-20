import fundamental_principle_edit_eval from "./edit_eval.spec";
export function fundamental_principle_validation() {
  describe("Principes Fondamentaux Validation", () => {
    beforeEach(() => {
      // Skip tutorial
      cy.disable_onboarding();
    });

    /**
     * Validation tests
     */

    context("Validation for 'Proportionnalité et nécessité'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 2, 1);
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 2, 1);
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });

    context("Validation for 'Mesures protectrices des droits'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 2, 2);
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 2, 2);
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });
  });
}

fundamental_principle_validation();
