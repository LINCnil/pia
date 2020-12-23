describe("Principes fondamentaux", () => {
  before(() => {
    cy.init();
    cy.disable_onboarding();
  });
  context("Proportionnalité et nécessité", () => {
    it("should complete textareas", () => {
      cy.create_new_pia();
      cy.wait(3000);
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
  context("Mesures protectrices des droits", () => {
    it("should complete textareas", () => {
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
});
