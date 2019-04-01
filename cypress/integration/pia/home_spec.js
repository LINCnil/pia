context("Actions", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4200");
  });

  it(".type()", () => {
    cy.get(".pia-authenticationBlock-auth");
  });
});
