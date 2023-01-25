describe("Entries_card", () => {
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
  });

  /**
   * Go to Entries page
   */
  context("landing", () => {
    it("should redirect on card", () => {
      cy.click_on_start();
    });
  });

  context("entries_card", () => {
    /**
     * Create new pia
     */
    it("should add new pia", () => {
      cy.create_new_pia();
    });

    /**
     * Edit pia
     */
    it("should edit pia", () => {
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.wait(1000);
      cy.get(".pia-cardsBlock-item-form input[formcontrolname='name']")
        .eq(1)
        .clear()
        .type("name edited");
      cy.get(".pia-cardsBlock-item-form input[formcontrolname='author_name']")
        .eq(1)
        .clear()
        .type("author_name edited");
      cy.get(
        ".pia-cardsBlock-item-form input[formcontrolname='evaluator_name']"
      )
        .eq(1)
        .clear()
        .type("evaluator_name edited");
      cy.get(
        ".pia-cardsBlock-item-form input[formcontrolname='validator_name']"
      )
        .eq(1)
        .clear()
        .type("validator_name edited");
      cy.get(".pia-cardsBlock-item-form input[formcontrolname='category']")
        .eq(1)
        .click();
    });

    /**
     * Duplicate pia
     */
    it("should duplicate pia", () => {
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.get(".pia-cardsBlock.pia").should("have.length", 1);
      cy.get(".pia-cardsBlock-toolbar-export a:eq(0)")
        .click()
        .then(() => {
          cy.get(".pia-cardsBlock.pia").should("have.length", 2);
        });
    });

    /**
     * Export pia
     */
    it("should export pia", () => {
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.get(".pia-cardsBlock-toolbar-export .fa-download")
        .eq(0)
        .click();
    });
  });
});
