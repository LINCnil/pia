import risk_edit_eval from "./edit_eval.spec";
export function risk_validation() {
  describe("Risques Validation", () => {
    beforeEach(() => {
      // Skip tutorial
      cy.disable_onboarding();
    });

    /**
     * Validation tests
     */

    context("Validation for 'Mesures existantes ou prévues'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 1).then(() => {
            cy.acceptMultipleEval();
            cy.closeValidationEvaluationModal();
          });
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 1).then(() => {
            cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
              "have.attr",
              "disabled"
            );
          });
        });
      });
    });

    context("Validation for 'Accès illégitime à des données'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 2).then(() => {
            cy.acceptEval();
            cy.closeValidationEvaluationModal();
          });
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 2).then(() => {
            cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
              "have.attr",
              "disabled"
            );
          });
        });
      });
    });

    context("Validation for 'Modification non désirées de données'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 3).then(() => {
            cy.acceptEval();
            cy.closeValidationEvaluationModal();
          });
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 3).then(() => {
            cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
              "have.attr",
              "disabled"
            );
          });
        });
      });
    });

    context("Validation for 'Disparition de données'", () => {
      it("should acept evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 4).then(() => {
            cy.acceptEval();
            cy.closeValidationEvaluationModal();
          });
        });
      });

      it("check accepted btn is blocked", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 4).then(() => {
            cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
              "have.attr",
              "disabled"
            );
          });
        });
      });
    });
  });
}

risk_validation();
