describe("dpo and pia refuse", () => {
  before(() => {
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  context("Prepare data with import", () => {
    // TODO: Import pia with .json
    it("File Upload using cypress-file-upload package", () => {
      cy.import_pia();
    });
  });

  context("Refuse or ask pia signature", () => {
    it(
      "should refuse pia",
      {
        retries: {
          runMode: 2,
          openMode: 2
        }
      },
      () => {
        cy.get_current_pia_id(id => {
          cy.go_edited_pia(id, 4, 3).then(() => {
            cy.validateDPO();
          });
          cy.refusePia();
        });
      }
    );
  });
});
