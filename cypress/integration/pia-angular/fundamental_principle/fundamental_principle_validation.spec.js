describe("Principes Fondamentaux", () => {
  before(() => {
    cy.init();

    cy.disable_onboarding();
  });

  context("prepare data", () => {
    it("create pia", () => {
      cy.create_new_pia();
    });

    it("set section 2 item 1", () => {
      cy.disable_onboarding();
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

    it("set section 2 item 2", () => {
      cy.disable_onboarding();
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

  context("Proportionnalité et nécessité", () => {
    it("should acept evaluation", () => {
      cy.disable_onboarding();
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 1).then(() => {
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });
  });
  context("Mesures protectrices des droits", () => {
    it("should acept evaluation", () => {
      cy.disable_onboarding();
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 2, 2).then(() => {
          cy.acceptMultipleEval();
          cy.closeValidationEvaluationModal();
        });
      });
    });
  });
});
