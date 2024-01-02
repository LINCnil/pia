import "cypress-localstorage-commands";
import "cypress-file-upload";

Cypress.Commands.add("init", () => {
  // TODO: DO IT IF PIA.id 2 exist
  indexedDB.deleteDatabase("pia");
  indexedDB.deleteDatabase("answer");
  indexedDB.deleteDatabase("comment");
  indexedDB.deleteDatabase("evaluation");
  indexedDB.deleteDatabase("measure");
  indexedDB.deleteDatabase("structure");
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then($win => {
    $win.sessionStorage.clear();
    cy.reload(true);
  });
});

Cypress.Commands.add("disable_onboarding", () => {
  cy.setLocalStorage("onboardingDashboardConfirmed", "true");
  cy.setLocalStorage("onboardingEntryConfirmed", "true");
  cy.setLocalStorage("onboardingEvaluationConfirmed", "true");
  cy.setLocalStorage("onboardingValidatedConfirmed", "true");
});

Cypress.Commands.add("skip_onboarding", () => {
  cy.get(".introjs-skipbutton").click();
});

Cypress.Commands.add("focus_out", () => {
  cy.get(".pia-knowledgeBaseBlock-searchForm form input[type='search']")
    .clear({ force: true })
    .type("Focus out")
    .trigger("blur", { force: true });
});

Cypress.Commands.add("go_edited_pia", (id = 2, section = 1, item = 1) => {
  cy.visit(`/#/pia/${id}/section/${section}/item/${item}`);
  cy.wait(2000);
});

Cypress.Commands.add("import_pia", () => {
  cy.click_on_start();
  const filepath = "pia.json";

  // Import
  cy.get('input[type="file"]#import_file').attachFile(filepath);
  // there is a new pia ?
  cy.get(".pia-cardsBlock.pia").should("have.length", 1);
  cy.wait(2000);
});
/**
 * Redirect Home page into Entries
 */
Cypress.Commands.add("click_on_start", () => {
  cy.visit("/");
  cy.get(".btn-green").click();
});

Cypress.Commands.add("create_new_pia", () => {
  cy.click_on_start();
  cy.get(".pia-newBlock-item-new-btn button").click();
  cy.get("#name").type("PIA Title");
  cy.get("#author_name").type("Author name");
  cy.get("#evaluator_name").type("Evaluator name");
  cy.get("#validator_name").type("Validator name");
  cy.get("#pia-save-card-btn")
    .first()
    .click();
});

Cypress.Commands.add("get_current_pia_id", callback => {
  cy.hash().then(value => {
    const id = value.split("/")[2];
    callback(id);
  });
});

Cypress.Commands.add("test_writing_on_textarea", () => {
  cy.get(".pia-questionBlock").each($el => {
    cy.wrap($el)
      .find(`textarea`)
      .first()
      .click({ force: true });
    cy.wrap($el)
      .find("iframe")
      .then($iframe => {
        const $body = $iframe.contents().find("body");
        cy.wrap($body)
          .clear({ force: true })
          .type(
            "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque"
          )
          .trigger("blur", { force: true });
      });
    cy.wait(500);
  });
  cy.get(".pia-questionBlock").each($el => {
    cy.wrap($el)
      .find(`textarea`)
      .first()
      .click({ force: true });
    cy.wait(500);
  });
  cy.focus_out();
});

Cypress.Commands.add("test_writing_on_textarea_gauges", () => {
  cy.get(".pia-gaugeBlock")
    .parent()
    .each($el => {
      cy.wait(500);
      cy.wrap($el)
        .find(`textarea`)
        .last()
        .click({ force: true });
      cy.wrap($el)
        .find("iframe")
        .then($iframe => {
          const $body = $iframe.contents().find("body");
          cy.wrap($body)
            .clear({ force: true })
            .type(
              "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque"
            );
        });
    });
  cy.get(".pia-gaugeBlock")
    .parent()
    .each($el => {
      cy.wait(500);
      cy.wrap($el)
        .find(`textarea`)
        .last()
        .click({ force: true });
    });
  cy.focus_out();
});

Cypress.Commands.add("test_add_measure", () => {
  cy.get(".btn-white > .pia-icons").click();
  cy.wait(1000);
  cy.get(".pia-measureBlock-title").each(($el, $index) => {
    cy.wrap($el).click();
    cy.wrap($el)
      .find("textarea")
      .clear({ force: true })
      .type("Measure " + $index, { force: true });
  });

  // Set content of measure
  cy.get(".pia-measureBlock-content").each($el => {
    cy.wrap($el)
      .find(`textarea`)
      .first()
      .click({ force: true });
    cy.wrap($el)
      .find("iframe")
      .then($iframe => {
        const $body = $iframe.contents().find("body");
        cy.wrap($body)
          .clear({ force: true })
          .type(
            "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque"
          );
      });
  });
  cy.focus_out();
});

Cypress.Commands.add("test_add_measure_from_sidebar", () => {
  cy.get(".pia-knowledgeBaseBlock-item-definition > .btn")
    .first()
    .click();
  cy.get(".pia-measureBlock-content").each($el => {
    $el
      .find("textarea")
      .val(
        "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque"
      );
    cy.wrap($el)
      .parent()
      .wait(500)
      .click();

    expect($el.find("textarea").val().length > 0).to.be.true;
  });
});

Cypress.Commands.add("test_add_tags", () => {
  cy.get("[aria-label='Enter the potential impacts']")
    .type("Tag 1")
    .type("{enter}");
  cy.get("[aria-label='Enter the threats']")
    .type("Tag 2")
    .type("{enter}");
  cy.get("[aria-label='Enter the risk sources']")
    .type("Tag 3")
    .type("{enter}");
  cy.get("[aria-label='Click here to select controls which address the risk.']")
    .type("Measure")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click({ force: true });
    });
});
Cypress.Commands.add("test_add_tags_next", () => {
  cy.get("[aria-label='Enter the potential impacts']")
    .type("Tag")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click({ force: true });
    });
  cy.get("[aria-label='Enter the threats']")
    .type("Tag")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click({ force: true });
    });
  cy.get("[aria-label='Enter the risk sources']")
    .type("Tag")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click({ force: true });
    });
  cy.get("[aria-label='Click here to select controls which address the risk.']")
    .type("Measure")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click({ force: true });
    });
});

Cypress.Commands.add("test_move_gauges", () => {
  cy.get(".pia-gaugeBlock").each($el => {
    cy.wrap($el)
      .find("input")
      .invoke("val", 3)
      .trigger("change", { force: true });
  });
});

Cypress.Commands.add("validateEval", () => {
  cy.focus_out();
  cy.get(".pia-entryContentBlock-footer .btn-green")
    .should("have.class", "btn-active")
    .click({ force: true });
});

Cypress.Commands.add("acceptEval", () => {
  cy.get(".pia-evaluationBlock .btn-green").click({ force: true });
  cy.get(".pia-entryContentBlock-footer .btn-green")
    .should("have.class", "btn-active")
    .click({ force: true });
});
Cypress.Commands.add("acceptMultipleEval", () => {
  cy.wait(3000);
  cy.get(".pia-evaluationBlock .btn-green").each($el => {
    cy.wait(500);
    cy.wrap($el).click({ force: true });
  });
  cy.get(".pia-entryContentBlock-footer")
    .find(".btn-green")
    .should("have.class", "btn-active")
    .click({ force: true });
});
Cypress.Commands.add("closeCompletedValidationEvaluationModal", () => {
  cy.get("#completed-evaluation")
    .invoke("show")
    .find("button")
    .last()
    .click({ force: true });
});
Cypress.Commands.add("closeValidationEvaluationModal", () => {
  cy.get("#validate-evaluation")
    .invoke("show")
    .find(".pia-modalBlock-close")
    .first()
    .click({ force: true });
});
Cypress.Commands.add("validateModal", () => {
  cy.get(".pia-modalBlock-content .btn.btn-green").click();
});
Cypress.Commands.add("redirectMeasureOnAcceptation", () => {
  cy.visit("/#/entry/2/section/3/item/3");
});
Cypress.Commands.add("validateDPO", () => {
  // 1 block
  const baseContentDPO = ".pia-entryContentBlock-content-DPO ";
  cy.get(baseContentDPO + "input.DPOName")
    .first()
    .type("DPO Pia", { force: true });
  cy.get(baseContentDPO + ".pia-entryContentBlock-content-DPO-treatment label")
    .first()
    .click({ force: true });
  cy.get(baseContentDPO)
    .find("textarea")
    .type(
      "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque",
      { force: true }
    );

  // 2 block
  const baseContentPeople = ".pia-entryContentBlock-content-people ";
  cy.get(baseContentPeople + "label[for=concerned-people-choice-searched]")
    .first()
    .click({ force: true });

  cy.get(baseContentPeople + "input.peopleNames")
    .first()
    .type("Pia's concerned people", { force: true });

  cy.get(baseContentPeople + "label[for=dpoAvis-1]")
    .first()
    .click({ force: true });

  cy.get(
    baseContentPeople + "textarea"
  ).type(
    "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque",
    { force: true }
  );
  cy.get(baseContentPeople)
    .find("form")
    .parent()
    .click({ force: true });
});
Cypress.Commands.add("validatePia", () => {
  cy.get(".pia-validatePIABlock")
    .find(".btn-green")
    .should("have.class", "btn-active")
    .click({ force: true });
  cy.get(".pia-entryContentBlock-content-list-confirm")
    .each($el => {
      cy.wrap($el)
        .find("label")
        .click({ force: true });
    })
    .then(() => {
      cy.get("#pia-simple-validation").click({ force: true });
    });
});
Cypress.Commands.add("validateModalComplete", () => {
  cy.get(".btn.btn-green").click({ force: true });
});
Cypress.Commands.add("refusePia", () => {
  cy.get(".pia-validatePIABlock")
    .find(".btn-green")
    .should("have.class", "btn-active")
    .click({ force: true });
  cy.get(".pia-entryContentBlock-content-list-confirm")
    .each($el => {
      cy.wrap($el)
        .find("label")
        .click({ force: true });
    })
    .then(() => {
      cy.get(".btn-red")
        .first()
        .click({ force: true });
      cy.get(".pia-entryContentBlock-content-subject-textarea")
        .find("textarea", { force: true })
        .then(() => {
          cy.get(".pia-entryContentBlock-content-subject-textarea")
            .find("textarea", { force: true })
            .type(
              "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque",
              { force: true }
            );
          cy.get(".pia-entryContentBlock-content-subject").click("bottom", {
            force: true
          });

          cy.get(".pia-entryContentBlock-footer")
            .find("button")
            .last()
            .click({ force: true });

          cy.wait(500);
          cy.get(
            ".pia-modalBlock.open .pia-modalBlock-buttons-choice button"
          ).click();

          cy.url().should("contain", "1/item/1");
          // TODO: Annuler l'evaluation
          // Faire des modifications
          // Redemander l'éval
          // Valider l'évaluation
          // Valider le pia => Url 4/item/5
          // Remplie le 2nd champ "modifications apportées"
          // Valider
        });
    });
});
