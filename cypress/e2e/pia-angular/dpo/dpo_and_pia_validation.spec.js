describe("Validation", () => {
  let visit_id = null;

  before(() => {
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  context("Prepare data with import", () => {
    // TODO: Import pia with .json
    it("File Upload using cypress-file-upload package", () => {
      cy.import_pia();
      cy.get("a.btn.btn-green")
        .first()
        .click();
    });
  });

  context("Avis du DPD et des personnes concernées", () => {
    it("should complete DPD", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 4, 3).then(() => {
          cy.validateDPO();
        });
      });
    });

    it("should valid pia", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 4, 3).then(() => {
          cy.validatePia();
          cy.closeValidationEvaluationModal();
        });
      });
    });

    it("should show report", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 4, 3).then(() => {
          cy.get(
            ".pia-entryContentBlock-header a.btn.pia-previewBlock"
          ).click();
          cy.url().should("include", "/preview/" + 2);
          cy.get(".pia-fullPreviewBlock-data").should("exist");
        });
      });
    });
  });
});
