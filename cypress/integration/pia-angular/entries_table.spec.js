describe("Entries_table", () => {
  /**
   * initialization
   */
  before(() => {
    // Clear datas
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  /**
   * Table
   */
  context("entries_table", () => {
    it("change display", () => {
      cy.click_on_start();
      cy.get(".pia-filtersBlock-switch").click();
    });

    it("verify if is there a table", () => {
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
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.get(".pia-filtersBlock-switch").click();
      cy.wait(3000);
      //Edit Title
      cy.get(".pia-list-table tbody tr td:eq(1) div")
        .click()
        .clear()
        .type("pia edited");

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
      cy.get(".pia-list-table tbody tr").should("have.length", 1);
      cy.get(".pia-list-table tbody tr td:eq(0) .fa-files-o")
        .click()
        .then(() => {
          cy.get(".pia-list-table tbody tr").should("have.length", 2);
        });
    });

    /**
     * Export pia
     */
    // it("should export pia", () => {
    //   cy.get(".pia-list-table tbody tr:eq(0) td:eq(0) .fa-download").click();
    // });
  });
});
