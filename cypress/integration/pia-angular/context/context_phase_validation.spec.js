describe("Contexte", () => {
  /**
   * initialization
   */
  before(() => {
    // Clear datas
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  context("prepare data", () => {
    it("Set 'Validation de vue d'ensemble'", () => {
      cy.create_new_pia().then(() => {
        cy.test_writing_on_textarea().then(() => {
          cy.validateEval();
          cy.validateModal();
        });
      });
    });

    it("Set 'Données, processus et supports'", () => {
      cy.test_writing_on_textarea();
      cy.validateEval();
      cy.validateModal();
    });
  });

  context("Validation for 'Validation de vue d'ensemble'", () => {
    it("should acept evaluation", () => {
      // GO BACK TO item 1 and validate it
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 1, 1).then(() => {
          cy.acceptEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
    it("check accepted btn is blocked", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 1, 1).then(() => {
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });
  });

  context("Validation for 'Données, processus et supports'", () => {
    it("should acept evaluation", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 1, 2).then(() => {
          cy.acceptEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
    it("check accepted btn is blocked", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 1, 2).then(() => {
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });
  });
});
