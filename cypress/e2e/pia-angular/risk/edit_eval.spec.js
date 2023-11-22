export function risk_edit_eval() {
  describe("Risques Edition / Evaluation", () => {
    /**
     * initialization
     */
    before(() => {
      // Clear data
      cy.init();
    });

    beforeEach(() => {
      // Skip tutorial
      cy.disable_onboarding();
    });

    /**
     * Prepare pia for test "Mesure existantes ou prévues"
     */
    context("prepare data", () => {
      it("prepare pia", () => {
        cy.create_new_pia().then(() => {
          cy.wait(500);
        });
      });
    });

    context("Test skip step (bad utilisation)", () => {
      it("alert modal", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 3); // Move prematurely to section 3, 3
          cy.get(".pia-modalBlock-content p.ng-star-inserted").should(
            "have.text",
            "Before evaluating risks,you must report theexisting or planned measures."
          );
        });
      });

      it("on click on btn.green, go back to section 3, 1", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 3);
          cy.get(".btn-green").click();
          cy.url().should("include", "section/3/item/1");
        });
      });
    });

    context("Mesures existantes ou prévues", () => {
      it("set Measures from sidebar", () => {
        // change section and item
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 1);
          cy.test_add_measure_from_sidebar(); // Set measure
        });
      });

      it("set Measures with + ", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 1);
          cy.test_add_measure();
          cy.wait(200);
        });
      });

      it("should valid evaluation", () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 3, 1);
          cy.validateEval();
          cy.validateModal();
        });
      });
    });

    context("Accès illégitime à des données", () => {
      it("should add tags and move gauges", () => {
        cy.get_current_pia_id(id => {
          // change section and item
          cy.go_edited_pia(id, 3, 2);
          cy.test_add_tags();
          cy.test_move_gauges();
          cy.test_writing_on_textarea_gauges();
        });
      });

      it("should valid evaluation", () => {
        cy.get_current_pia_id(id => {
          // change section and item
          cy.go_edited_pia(id, 3, 2);
          cy.validateEval();
          cy.validateModal();
        });
      });
    });

    context("Modification non désirées de données", () => {
      it("should add tags and move gauges", () => {
        cy.get_current_pia_id(id => {
          // change section and item
          cy.go_edited_pia(id, 3, 3).then(() => {
            cy.test_add_tags_next();
            cy.test_move_gauges();
            cy.test_writing_on_textarea_gauges();
            cy.validateEval();
            cy.validateModal();
          });
        });
      });

      //
      // it("should valid evaluation", () => {
      //   cy.get_current_pia_id(id => {
      //     // change section and item
      //     cy.go_edited_pia(id, 3, 3).then(() => {
      //       cy.validateEval();
      //       cy.validateModal();
      //     });
      //   });
      // });
    });

    context("Disparition de données", () => {
      it("should complete together view", () => {
        cy.get_current_pia_id(id => {
          // change section and item
          cy.go_edited_pia(id, 3, 4);
          cy.test_add_tags_next();
          cy.test_move_gauges();
          cy.test_writing_on_textarea_gauges();
        });
      });

      it("should valid evaluation", () => {
        cy.get_current_pia_id(id => {
          // change section and item
          cy.go_edited_pia(id, 3, 4);
          cy.validateEval();
          cy.validateModalComplete();
        });
      });
    });
  });
}

risk_edit_eval();
