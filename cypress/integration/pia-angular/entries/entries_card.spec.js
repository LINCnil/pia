describe("Entries_card", () => {
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
      cy.create_new_pia().then(() => {
        cy.wait(500);
      });
    });

    /**
     * Edit pia
     */
    it("should edit pia", () => {
      //cy.wait(500);
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.wait(3000);
      cy.get("#pia-edit-2-name")
        .clear()
        .type("pia edited");
      cy.get("#pia-edit-2-author-name")
        .clear()
        .type("author edited");
      cy.get("#pia-edit-2-evaluator-name")
        .clear()
        .type("evaluator edited");
      cy.get("#pia-edit-2-validator-name")
        .clear()
        .type("validator edited");
    });

    /**
     * Duplicate pia
     */
    it("should duplicate pia", () => {
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.wait(3000);
      cy.get(".pia-cardsBlock.pia").should("have.length", 1);
      cy.get(".pia-cardsBlock-toolbar-export a")
        .eq(1)
        .click()
        .then(() => {
          cy.wait(10000);
          cy.get(".pia-cardsBlock.pia").should("have.length", 2);
        });
    });

    /**
     * Export pia
     */
    it("should export pia", () => {
      // Redirect into entries
      cy.visit(`/#/entries`);
      cy.get(".pia-cardsBlock-toolbar-export a")
        .eq(2)
        .click();
    });
  });
});
