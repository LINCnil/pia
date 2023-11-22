describe("Validation", () => {
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

  context("Refuse or ask pia signature", () => {
    it("should refuse pia", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 4, 3);
        cy.validateDPO();
        cy.refusePia();
      });
    });
  });
});
