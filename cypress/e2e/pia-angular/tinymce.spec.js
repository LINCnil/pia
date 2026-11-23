describe("TinyMCE navigation", () => {
  function checkpoint(message) {
    cy.log(message);
    if (Cypress.config("isInteractive")) {
      cy.pause();
    }
  }

  beforeEach(() => {
    cy.visit("/");
    cy.init();
    cy.disable_onboarding();
  });

  it("opens template editors after editing a PIA in the same session", () => {
    cy.create_new_pia();
    checkpoint("1. Nouveau PIA créé : vérifier la section Vue d'ensemble.");
    cy.test_writing_on_textarea();
    checkpoint(
      "2. Champs remplis : vérifier le contenu enregistré par TinyMCE."
    );

    cy.get(".pia-entryContentBlock-footer .btn-green")
      .should("be.enabled")
      .click();
    checkpoint("3. Ask for review : vérifier la confirmation affichée.");
    cy.validateModal();

    cy.get('a[href="#/entries/structure"]').first().click();
    checkpoint("4. Modèles de PIA : vérifier la page avant création.");
    cy.get(".pia-newBlock-item-new-btn button").click();
    cy.get("#name").type("TinyMCE template");
    cy.get("#sector_name").type("Regression");
    cy.get("#structure-save-card-btn").click();
    checkpoint("5. Modèle créé : vérifier la première question.");

    cy.get("#pia-question-content-111").click();
    checkpoint(
      "6. Première réponse activée : vérifier le chargement de TinyMCE."
    );
    cy.get("#pia-question-content-111_ifr")
      .editorBody()
      .should("have.attr", "contenteditable", "true")
      .type("Template answer");
    cy.get(".pia-entryContentBlock-header").click();
    cy.get("#pia-question-content-111_ifr").should("not.exist");
    cy.get(".pia-questionBlock-contentText")
      .first()
      .should("be.visible")
      .and("contain", "Template answer");
  });
});
