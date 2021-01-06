describe("Risques", () => {
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
    it("prepare pia", () => {
      // CREATE FOR TESTING
      cy.create_new_pia().then(() => {
        cy.wait(500);
        // cy.test_writing_on_textarea();
      });
    });

    it("set section 'risk' / 'Mesures existantes ou prévues' and valid eval", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 3, 1).then(() => {
          cy.test_add_measure_from_sidebar().then(() => {
            cy.test_writing_on_textarea().then(() => {
              // Set measure
              cy.validateEval();
              cy.validateModal();
            });
          });
        });
      });
    });

    it("set section 'risk' / 'Accès illégitime à des données' and valid eval", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 3, 2).then(() => {
          cy.test_add_tags();
          cy.test_move_gauges();
          cy.test_writing_on_textarea().then(() => {
            cy.validateEval();
            cy.validateModal();
          });
        });
      });
    });

    it("set section 'risk' / 'Modification non désirées de données' and valid eval", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 3, 3).then(() => {
          cy.test_add_tags_next();
          cy.test_move_gauges();
          cy.test_writing_on_textarea().then(() => {
            cy.validateEval();
            cy.validateModal();
          });
        });
      });
    });

    it("set section 'risk' / 'Disparition de données", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 3, 4).then(() => {
          cy.test_add_tags_next();
          cy.test_move_gauges();
          cy.test_writing_on_textarea().then(() => {
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

  context("Validation for 'Mesures existantes ou prévues'", () => {
    it("should acept evaluation", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 3, 1).then(() => {
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
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
          // cy.redirectMeasureOnAcceptation();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
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

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
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
          // cy.closeCompletedValidationEvaluationModal();
        });
      });
    });

    // TODO: CHECK ACCEPTED BTN IS BLOCKED
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

  // context("Vue d'ensemble des risques", () => {
  //   it("should close modal and redirect to context", () => {
  //     const url = "http://localhost:4200/#/entry/2/section/4/item/3";
  //     cy.visit(url);
  //   });
  // });
});
