describe("Entries_table", () => {
  /**
   * initialization
   */
  before(() => {
    // Clear data
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
    cy.visit(`/#/entries`);
    // cy.get(".pia-filtersBlock-switch").click({force: true});
  });

  /**
   * Table
   */
  context("entries_table", () => {
    it("change display and check if there is a table", () => {
      cy.get(".pia-filtersBlock-switch").click({ force: true });
      cy.get("table").should("exist");
    });

    /**
     * Create pia
     */
    it("should add new pia", () => {
      cy.get(".pia-filtersBlock-buttons button")
        .first()
        .click()
        .then(() => {
          cy.get("#name").type("PIA Title");
          cy.get("#author_name").type("Author name");
          cy.get("#evaluator_name").type("Evaluator name");
          cy.get("#validator_name").type("Validator name");
          cy.get("#pia-save-card-btn")
            .first()
            .click();
        });
    });

    /**
     * Edit pia
     */
    it("should edit pia", () => {
      //Edit Title
      cy.wait(500);
      cy.get(".pia-list-table tbody tr td:eq(1) div")
        .click()
        .clear()
        .type("pia edited for table test");

      //Edit author
      cy.get(".pia-list-table tbody tr td:eq(3) div")
        .click()
        .clear()
        .type("author edited");

      //Edit evaluator
      cy.get(".pia-list-table tbody tr td:eq(4) div")
        .click()
        .clear()
        .type("evaluator edited");

      //Edit validator
      cy.get(".pia-list-table tbody tr td:eq(5) div")
        .click()
        .clear()
        .type("validator edited");
    });

    /**
     * Duplicate pia
     */
    it("should duplicate pia", () => {
      // cy.get(".pia-list-table tbody tr").should("have.length", 1);
      cy.get(".pia-list-table tbody tr:eq(0) td:eq(0) .fa-files-o").click();
      cy.get(".pia-list-table tbody tr:eq(1)");
      cy.get(".pia-list-table tbody tr").should("have.length", 2);
    });

    /**
     * Export pia
     */
    it("should export pia", () => {
      cy.get(".pia-list-table tbody tr:eq(0) td:eq(0) .fa-download").click();
    });
  });
});
