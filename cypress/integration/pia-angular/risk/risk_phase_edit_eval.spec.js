describe("Risques", () => {
  before(() => {
    cy.init();
    cy.disable_onboarding().then(() => {
      cy.visit("http://localhost:4200");
    });
  });

  /**
   * Prepare pia for test "Mesure existantes ou prévues"
   */
  context("prepare data", () => {
    it("prepare pia", () => {
      // CREATE FOR TESTING
      cy.disable_onboarding();
      cy.create_new_pia().then(() => {
        cy.wait(500);
        // cy.test_writing_on_textarea();
      });
    });
  });

  context("Test skip step (bad utilisation)", () => {
    it("alert modal", () => {
      cy.disable_onboarding();
      cy.go_edited_pia(2, 3, 3) // Move prematurely to section 3, 3
        .then(() => {
          cy.get(".pia-modalBlock-content p.ng-star-inserted").should(
            "have.text",
            "Before evaluating risks,you must report theexisting or planned measures."
          );
        });
    });

    it("on click on btn.green, go back to section 3, 1", () => {
      cy.get(".btn-green").click();
      cy.url().should("include", "section/3/item/1");
    });
  });

  context("Mesures existantes ou prévues", () => {
    it("set Measures from sidebar", () => {
      cy.disable_onboarding();
      // change section and item
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 3, 1);
        cy.test_add_measure_from_sidebar(); // Set measure
      });
    });

    it("set Measures with + ", () => {
      cy.disable_onboarding();
      cy.test_add_measure().then(() => {
        cy.wait(200);
      });
    });

    it("should valid evaluation", () => {
      cy.disable_onboarding();
      cy.validateEval();
    });

    it("should valid modal for evaluation", () => {
      cy.disable_onboarding();
      cy.validateModal();
    });
  });

  context("Accès illégitime à des données", () => {
    it("should add tags and move gauges", () => {
      cy.disable_onboarding();
      cy.get_current_pia_id(id => {
        // change section and item
        cy.go_edited_pia(id, 3, 2);
        cy.wait(1000);
        cy.test_add_tags();
        cy.test_move_gauges();
        cy.test_writing_on_textarea();
      });
    });

    it("should valid evaluation", () => {
      cy.validateEval();
    });

    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });

  context("Modification non désirées de données", () => {
    it("should add tags and move gauges", () => {
      cy.disable_onboarding();
      cy.get_current_pia_id(id => {
        // change section and item
        cy.go_edited_pia(id, 3, 3);
        cy.wait(500);
        cy.test_add_tags_next();
        cy.test_move_gauges();
        cy.test_writing_on_textarea();
      });
    });
    //
    it("should valid evaluation", () => {
      cy.validateEval();
    });

    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });

  context("Disparition de données", () => {
    it("should complete together view", () => {
      cy.disable_onboarding();
      cy.get_current_pia_id(id => {
        // change section and item
        cy.go_edited_pia(id, 3, 4);
        cy.test_add_tags_next();
        cy.test_move_gauges();
        cy.test_writing_on_textarea();
      });
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModalComplete();
    });
  });
});
