describe("Validation", () => {
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });
  context("Avis du DPD et des personnes concernées", () => {
    it("should complete DPD", () => {
      cy.validateDPO();
    });
    it("should valid pia", () => {
      cy.validatePia();
      cy.closeValidationEvaluationModal();
    });
    it("should show report", () => {
      cy.get(
        '.pia-entryContentBlock-footer-validationTools > [href="#/preview/2"]'
      ).click();
      cy.get(".fa-chevron-left").click();
      cy.validatePia();
    });
    it("should show report and plan action download", () => {
      cy.get(
        '.pia-entryContentBlock-footer-validationTools > [href="#/preview/2'
      ).click();
      cy.get("angular2csv").click();
      cy.get(".fa-chevron-left").click();
      cy.validatePia();
    });
  });
});
