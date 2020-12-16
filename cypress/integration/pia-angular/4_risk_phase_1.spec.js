describe("Risques", () => {
  context("Mesures existantes ou prévues", () => {
    it("should complete textareas", () => {
      cy.test_add_measure_from_sidebar();
      cy.test_add_measure();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
  context("Accès illégitime à des données", () => {
    it("should add tags and move gauges", () => {
      cy.test_add_tags();
      cy.test_move_gauges();
      cy.test_writing_on_textarea();
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
      cy.test_add_tags_next();
      cy.test_move_gauges();
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModal();
    });
  });
  context("Disparition de données", () => {
    it("should complete to gether view", () => {
      cy.test_add_tags_next();
      cy.test_move_gauges();
      cy.test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      cy.validateEval();
    });
    it("should valid modal for evaluation", () => {
      cy.validateModalComplete();
    });
  });
});
