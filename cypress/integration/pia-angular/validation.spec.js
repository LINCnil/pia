import context_validation from "./context/validation.spec";
import fundamental_principle_validation from "./fundamental_principle/validation.spec";
import risk_validation from "./risk/validation.spec";

describe("Validation", () => {
  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  context("Alert on prematured section access", () => {
    it("get alert if user try to set dpo", () => {
      cy.get("a[href='#/pia/2/section/4/item/3']")
        .click()
        .then(() => {
          cy.wait(200);
          cy.get(".pia-modalBlock.open .pia-modalBlock-content p").should(
            "have.text",
            "You need to complete the review of the analysis to access the DPO page."
          );
        });
    });
  });

  context("Avis du DPD et des personnes concernées", () => {
    // context_validation();
    // it("should complete DPD", () => {
    //   cy.validateDPO();
    // });
    // it("should valid pia", () => {
    //   cy.validatePia();
    //   cy.closeValidationEvaluationModal();
    // });
    // it("should show report", () => {
    //   cy.get(
    //     '.pia-entryContentBlock-footer-validationTools > [href="#/preview/2"]'
    //   ).click();
    //   cy.get(".fa-chevron-left").click();
    //   cy.validatePia();
    // });
    // it("should show report and plan action download", () => {
    //   cy.get(
    //     '.pia-entryContentBlock-footer-validationTools > [href="#/preview/2'
    //   ).click();
    //   cy.get("angular2csv").click();
    //   cy.get(".fa-chevron-left").click();
    //   cy.validatePia();
    // });
  });
});
