describe("Principes Fondamentaux", () => {
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

  /**
   * prepare data for test
   */
  context("prepare data", () => {
    it("create pia", () => {
      cy.create_new_pia();
    });

    it("set 'Proportionnalité et nécessité'", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 1).then(() => {
          cy.test_writing_on_textarea().then(() => {
            cy.wait(2000);
            cy.validateEval();
            cy.validateModal();
          });
        });
      });
    });

    it("set 'Mesures protectrices des droits'", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 2).then(() => {
          cy.test_writing_on_textarea().then(() => {
            cy.wait(2000);
            cy.validateEval();
            cy.validateModal();
          });
        });
      });
    });
  });

  /**
   * Validation tests
   */

  context("Validation for 'Proportionnalité et nécessité'", () => {
    it("should acept evaluation", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 1).then(() => {
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
    it("check accepted btn is blocked", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 1).then(() => {
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });
  });

  context("Validation for 'Mesures protectrices des droits'", () => {
    it("should acept evaluation", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 2).then(() => {
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
    it("check accepted btn is blocked", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 2).then(() => {
          cy.get(".pia-evaluationBlock-buttons:eq(0) .btn-green").should(
            "have.attr",
            "disabled"
          );
        });
      });
    });
  });
});
