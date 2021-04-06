import "cypress-localstorage-commands";
import "cypress-file-upload";

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
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
  cy.window().then(win => {
    win.sessionStorage.clear();
  });
  cy.wait(1000);
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
  cy.get(".pia-knowledgeBaseBlock-searchForm form input").click({
    force: true
  });
});

Cypress.Commands.add("go_edited_pia", (id = 2, section = 1, item = 1) => {
  cy.visit(`/#/pia/${id}/section/${section}/item/${item}`);
  cy.wait(3000);
});

Cypress.Commands.add("import_pia", () => {
  cy.click_on_start();
  const filepath = "pia.json";

  // Import
  cy.get('input[type="file"]#import_file').attachFile(filepath);
  cy.wait(5000);

  // there is a new pia ?
  cy.get(".pia-cardsBlock.pia").should("have.length", 1);
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
  cy.wait(500);
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
  cy.get("textarea").then($el => {
    for (const $textarea of $el) {
      cy.wrap($textarea).then($textarea => {
        $textarea.val(
          "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque"
        );
        cy.wrap($textarea)
          .click({ force: true })
          .then(() => {
            cy.wait(1000);
          });
      });
    }
  });
});

Cypress.Commands.add("test_add_measure", () => {
  cy.get(".btn-white > .pia-icons")
    .click()
    .then(() => {
      // Set title of measure
      cy.get(".pia-measureBlock-title").each(($el, $index, $list) => {
        cy.wrap($el).click();
        cy.wrap($el)
          .find("textarea")
          .type("Measure 1");
      });

      // Set content of measure
      cy.get(".pia-measureBlock-content").each(($el, $index, $list) => {
        cy.wrap($el).click();
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

        cy.focus_out();
      });
    });
});

Cypress.Commands.add("test_add_measure_from_sidebar", () => {
  cy.get(".pia-knowledgeBaseBlock-item-definition > .btn")
    .first()
    .click();
  cy.get(".pia-measureBlock-content").each(($el, $index, $list) => {
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

    cy.focus_out();
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
      cy.wait(300);
      cy.get(".ng2-menu-item")
        .first()
        .click();
    });
});
Cypress.Commands.add("test_add_tags_next", () => {
  cy.get("[aria-label='Enter the potential impacts']")
    .type("Tag")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click();
    });
  cy.get("[aria-label='Enter the threats']")
    .type("Tag")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click();
    });
  cy.get("[aria-label='Enter the risk sources']")
    .type("Tag")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click();
    });
  cy.get("[aria-label='Click here to select controls which address the risk.']")
    .type("Measure")
    .then(() => {
      cy.wait(500);
      cy.get(".ng2-menu-item")
        .first()
        .click();
    });
});

Cypress.Commands.add("test_move_gauges", () => {
  cy.get(".pia-gaugeBlock").each(($el, $index, $list) => {
    cy.wrap($el)
      .find("input")
      .invoke("val", 3)
      .trigger("change", { force: true });
  });
});

Cypress.Commands.add("validateEval", () => {
  cy.focus_out().then(() => {
    cy.wait(1000);
    cy.get(".pia-entryContentBlock-footer")
      .find(".btn-green")
      .should("have.class", "btn-active")
      .click();
  });
});

Cypress.Commands.add("acceptEval", () => {
  cy.get(".pia-evaluationBlock")
    .find(".btn-green")
    .click()
    .then(() => {
      cy.get(".pia-entryContentBlock-footer")
        .find(".btn-green")
        .should("have.class", "btn-active")
        .click();
    });
});
Cypress.Commands.add("acceptMultipleEval", () => {
  cy.get(".pia-evaluationBlock")
    .find(".btn-green")
    .each(($el, $index, $list) => {
      cy.wait(500);
      cy.wrap($el)
        .click()
        .wait(250);
    });
  cy.wait(500)
    .get(".pia-entryContentBlock-footer")
    .find(".btn-green")
    .should("have.class", "btn-active")
    .click();
});
Cypress.Commands.add("closeCompletedValidationEvaluationModal", () => {
  cy.wait(500)
    .get("#completed-evaluation")
    .invoke("show")
    .find("button")
    .last()
    .click()
    .wait(500);
});
Cypress.Commands.add("closeValidationEvaluationModal", () => {
  cy.wait(500)
    .get("#validate-evaluation")
    .invoke("show")
    .find(".pia-modalBlock-close")
    .first()
    .click()
    .wait(500);
});
Cypress.Commands.add("validateModal", () => {
  cy.wait(500)
    .get(".pia-modalBlock-content .btn.btn-green")
    .click()
    .wait(500);
});
Cypress.Commands.add("redirectMeasureOnAcceptation", () => {
  cy.visit("/#/entry/2/section/3/item/3");
});
Cypress.Commands.add("validateDPO", () => {
  cy.get(".pia-entryContentBlock-content-DPO").each(($el, $index, $list) => {
    cy.wrap($el)
      .find("input")
      .first()
      .type("DPO Pia", { force: true });
    cy.wrap($el)
      .find(".pia-entryContentBlock-content-DPO-treatment")
      .find("label")
      .first()
      .click();
    cy.wrap($el)
      .find("textarea")
      .type(
        "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque",
        { force: true }
      );
  });
  cy.get(".pia-entryContentBlock-content-people").each(($el, $index, $list) => {
    cy.wrap($el)
      .find("form")
      .first()
      .find("label")
      .first()
      .click();
    cy.wrap($el)
      .find("form")
      .last()
      .find("input")
      .first()
      .type("DPO Pia", { force: true });
    cy.wrap($el)
      .find("form")
      .last()
      .find("label")
      .first()
      .click();
    cy.wrap($el)
      .find("form")
      .last()
      .find("textarea")
      .type(
        "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque",
        { force: true }
      );
    cy.wrap($el)
      .find("form")
      .parent()
      .click();
  });
});
Cypress.Commands.add("validatePia", () => {
  cy.get(".pia-validatePIABlock")
    .find(".btn-green")
    .should("have.class", "btn-active")
    .click();
  cy.wait(500)
    .get(".pia-entryContentBlock-content-list-confirm")
    .each(($el, $index, $list) => {
      cy.wrap($el)
        .find("label")
        .click();
    })
    .then(() => {
      cy.get("#pia-simple-validation").click();
    });
});
Cypress.Commands.add("validateModalComplete", () => {
  cy.wait(500)
    .get(".btn.btn-green")
    .click()
    .wait(500);
});
Cypress.Commands.add("refusePia", () => {
  cy.get(".pia-validatePIABlock")
    .find(".btn-green")
    .should("have.class", "btn-active")
    .click();
  cy.wait(500)
    .get(".pia-entryContentBlock-content-list-confirm")
    .each(($el, $index, $list) => {
      cy.wrap($el)
        .find("label")
        .click();
    })
    .then(() => {
      cy.get(".btn-red")
        .first()
        .click();
      cy.wait(3000);
      cy.get(".pia-entryContentBlock-content-subject-textarea")
        .find("textarea", { force: true })
        .type(
          "Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque",
          { force: true }
        );
      cy.get(".pia-entryContentBlock-content-subject")
        .wait(500)
        .click("bottom");
      cy.wait(500)
        .get(".pia-entryContentBlock-footer")
        .find("button")
        .last()
        .click();
      cy.get("#modal-refuse-pia > .pia-modalBlock-content > .btn").click();
    });
});
