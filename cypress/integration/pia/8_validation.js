describe("Validation", () => {
  context("Avis du DPD et des personnes concernées", () => {
    it("should complete DPD", () => {
      cy.validateDPO()
    });
    it ("should valid pia", () => {
      cy.validatePia();
      cy.closeValidationEvaluationModal();
    });
    it ("should show repport", () => {
      cy.get('.pia-entryContentBlock-footer-validationTools > [href="#/summary/3"]').click();
      cy.get(".fa-chevron-left").click();
      cy.validatePia();
    });
    it ("should show repports and plan action dowload", () => {
      cy.get('.pia-entryContentBlock-footer-validationTools > [href="#/summary/3?displayOnlyActionPlan=true"]').click();
      cy.get('[title="Télécharger un export CSV"] > .fa').click();
      cy.get(".fa-chevron-left").click();
      cy.validatePia();
    });
    it ("should show", () => {
      cy.get('.pia-entryContentBlock-footer-validationTools > [href="#/summary/3?displayOnlyActionPlan=true"]').click();
      cy.get('[title="Télécharger un export CSV"] > .fa').click();
      cy.get(".fa-chevron-left").click();
    });
  });
});
