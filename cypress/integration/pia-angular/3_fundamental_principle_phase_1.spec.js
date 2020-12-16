describe("Principes fondamentaux", () => {
  context("Proportionnalité et nécessité", () => {
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
