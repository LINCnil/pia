before("Purge Pia before run", () => {
  indexedDB.deleteDatabase("pia");
  indexedDB.deleteDatabase("evaluation");
  indexedDB.deleteDatabase("structure");
  indexedDB.deleteDatabase("comment");
  indexedDB.deleteDatabase("measure");
  indexedDB.deleteDatabase("answer");
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then(win => {
    win.sessionStorage.clear();
  });
});
describe("Home", () => {
  const endPoint = "http://localhost:4200/entries";
  context("landing", () => {
    it("should have class authenticationBlock-auth", () => {
      cy.visit(endPoint);
      cy.get(".pia-authenticationBlock-auth");
    });
    it("should redirect on card", () => {
      cy.get(".btn-green").click();
    });
  });
  context("home_card", () => {
    it("should add new pia", () => {
      cy.get(".pia-newBlock-item-new-btn button").click();
      cy.get("#name").type("PIA Title");
      cy.get("#author_name").type("Author name");
      cy.get("#evaluator_name").type("Evaluator name");
      cy.get("#validator_name").type("Validator name");
      cy.get("#pia-save-card-btn")
        .first()
        .click();
      cy.visit(`${endPoint}/#/home/card`);
    });
    it("should edit pia", () => {
      cy.wait(500);
      cy.get("#pia-edit-name").type("pia edited");
      cy.get("#pia-edit-author-name")
        .clear()
        .type("author edited");
      cy.get("#pia-edit-evaluator-name")
        .clear()
        .type("evaluator edited");
      cy.get("#pia-edit-validator-name")
        .clear()
        .type("validator edited");
    });
    it("should duplicate pia", () => {
      cy.get(".pia-cardsBlock.pia").should("have.length", 1);
      cy.get(".pia-cardsBlock-toolbar-export a")
        .first()
        .click();
      cy.wait(500);
      cy.get(".pia-cardsBlock.pia").should("have.length", 2);
    });
    it("should export pia", () => {
      cy.get(".pia-cardsBlock-toolbar-export a")
        .eq(1)
        .click();
    });
  });
  context("home_list", () => {
    it("should change view card and list", () => {
      cy.get(".pia-filtersBlock-switch").click();
      cy.get(".pia-list-table");
      cy.get(".pia-tooltip")
        .first()
        .click();
    });
  });
});
