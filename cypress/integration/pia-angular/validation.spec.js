describe("Validation", () => {
  before(() => {
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  // context("Alert on prematured section access", () => {
  //   it("get alert if user try to set dpo", () => {
  //     cy.get("a[href='#/pia/2/section/4/item/3']")
  //       .click()
  //       .then(() => {
  //         cy.wait(200);
  //         cy.get(".pia-modalBlock.open .pia-modalBlock-content p").should(
  //           "have.text",
  //           "You need to complete the review of the analysis to access the DPO page."
  //         );
  //       });
  //   });
  // });

  context("Prepare data with import", () => {
    // TODO: Import pia with .json
    it("File Upload using cypress-file-upload package", () => {
      // cy.click_on_start();

      // const filepath = 'pia.json';

      // // Import
      // cy.get('input[type="file"]#import_file').attachFile(filepath)

      // cy.wait(5000)
      // // there is a new pia ?
      // cy.get(".pia-cardsBlock.pia").should("have.length", 1);
      cy.import_pia();
    });
  });

  context("Avis du DPD et des personnes concernées", () => {
    it("should complete DPD", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 4, 3).then(() => {
          cy.validateDPO();
        });
      });
    });
    it("should valid pia", () => {
      cy.validatePia();
      // cy.closeValidationEvaluationModal();
    });
    it("should show report", () => {
      cy.closeValidationEvaluationModal();
      cy.get('.pia-previewBlock[href="#/preview/2"]').click();

      cy.url().should("include", "/preview/2");

      cy.get(".pia-fullPreviewBlock-data").should("exist");
    });
  });

  context("Refuse or ask pia signature", () => {
    it("Upload file", () => {
      cy.init();
      cy.disable_onboarding();
      // cy.click_on_start();
      // const filepath = 'pia.json';

      // // Import
      // cy.get('input[type="file"]#import_file').attachFile(filepath)
      // cy.wait(5000)

      // // there is a new pia ?
      // cy.get(".pia-cardsBlock.pia").should("have.length", 1);
      cy.import_pia();
    });
    it("should refuse pia", () => {
      cy.get_current_pia_id(id => {
        cy.go_edited_pia(id, 4, 3).then(() => {
          cy.validateDPO();
        });
        cy.refusePia();
      });
    });
  });
});
