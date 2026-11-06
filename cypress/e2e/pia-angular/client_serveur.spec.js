describe("Client-Server", () => {
  const serverUrl = `${Cypress.config("baseUrl")}/test-server`;
  const clientId = "test-client";
  const clientSecret = "test-secret";
  const configuredServer = Cypress.env("URL");
  const configuredClientId = Cypress.env("ID");
  const configuredClientSecret = Cypress.env("SECRET");

  before(() => {
    // Clear data
    cy.init();
  });

  beforeEach(() => {
    // Skip tutorial
    cy.disable_onboarding();
  });

  function openSettings(url = serverUrl, id = clientId, secret = clientSecret) {
    cy.visit("/");
    cy.get(".pia-navigationBlock-dropdown").eq(0).trigger("mouseover");
    cy.get(".ng-untouched fieldset a").eq(0).click({ force: true });
    cy.location("hash").should("eq", "#/url");
    cy.get("#server_url").clear().type(url);
    cy.get("#client_id").clear().type(id, { log: false });
    cy.get("#client_secret").clear().type(secret, { log: false });
  }

  it("saves server settings after successful validation", () => {
    cy.intercept("POST", "/test-server/info", {
      statusCode: 200,
      body: { valid: true, auth: false },
    }).as("validateServer");
    cy.intercept("GET", "/test-server/oauth/token/info", {
      statusCode: 404,
      body: {},
    });

    openSettings();
    cy.get(".pia-settingsBlock-server button[type=submit]").click();
    cy.wait("@validateServer")
      .its("request.headers.content-type")
      .should("include", "multipart/form-data");
    cy.get(".pia-modalBlock-content p")
      .first()
      .should("contain", "The server address has been updated");
    cy.window().should((win) => {
      expect(win.localStorage.getItem("server_url")).to.equal(serverUrl);
      expect(win.localStorage.getItem("client_id")).to.equal(clientId);
      expect(win.localStorage.getItem("client_secret")).to.equal(clientSecret);
    });
    cy.get(".pia-modalBlock-buttons-choice button[type=button]").click();
    cy.location("hash").should("eq", "#/");
  });

  it("does not save settings rejected by the server", () => {
    cy.intercept("POST", "/test-server/info", {
      statusCode: 200,
      body: { valid: false, auth: false },
    }).as("validateServer");

    openSettings();
    cy.get(".pia-settingsBlock-server button[type=submit]").click();
    cy.wait("@validateServer");
    cy.get(".pia-modalBlock-content p")
      .first()
      .should("contain", "have not been validated");
    cy.window().should((win) => {
      expect(win.localStorage.getItem("server_url")).to.be.null;
      expect(win.localStorage.getItem("client_id")).to.be.null;
      expect(win.localStorage.getItem("client_secret")).to.be.null;
    });
    cy.get(".pia-modalBlock-buttons-choice button[type=button]").click();
    cy.location("hash").should("eq", "#/url");
  });

  if (configuredServer || configuredClientId || configuredClientSecret) {
    it("validates credentials against the configured server", () => {
      expect(Boolean(configuredServer), "CYPRESS_URL is configured").to.be.true;
      expect(Boolean(configuredClientId), "CYPRESS_ID is configured").to.be
        .true;
      expect(Boolean(configuredClientSecret), "CYPRESS_SECRET is configured").to
        .be.true;

      openSettings(
        configuredServer,
        configuredClientId,
        configuredClientSecret
      );
      cy.get(".pia-settingsBlock-server button[type=submit]").click();
      cy.get(".pia-modalBlock-content p")
        .first()
        .should("contain", "The server address has been updated");
      cy.window().should((win) => {
        expect(win.localStorage.getItem("server_url")).to.equal(
          configuredServer.trim()
        );
        expect(
          win.localStorage.getItem("client_id") === configuredClientId,
          "client ID is saved"
        ).to.be.true;
        expect(
          win.localStorage.getItem("client_secret") === configuredClientSecret,
          "client secret is saved"
        ).to.be.true;
      });
    });
  }
});
