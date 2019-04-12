
// Phase 1 first itération

describe("Contexte", () => {
  context("Vue d'ensemble", () => {
    it("should complete textareas", () => {
      //cy.visit(endPoint);
      test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      validateEval()
    });
    it("should valid modal for evaluation", () => {
      validateModal()
    });
  });
  context("Données, processus et supports", () => {
    it("should complete textareas", () => {
      test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      validateEval()
    });
    it("should valid modal for evaluation", () => {
      validateModal()
    });
  });
});
describe("Principes fondamentaux", () => {
  context("Proportionnalité et nécessité", () => {
    it("should complete textareas", () => {
      test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      validateEval();
    });
    it("should valid modal for evaluation", () => {
      validateModal();
    });
  });
  context("Mesures protectrices des droits", () => {
    it("should complete textareas", () => {
      test_writing_on_textarea();
    });
    it("should valid evaluation", () => {
      validateEval();
    });
    it("should valid modal for evaluation", () => {
      validateModal();
    });
  });
});
describe("Risques", () => {
  context("Mesures existantes ou prévues", () => {
    it("should complete textareas", () => {
      test_add_measure_from_sidebar();
      test_add_measure();
    });
    it("should valid evaluation", () => {
      validateEval()
    });
    it("should valid modal for evaluation", () => {
      validateModal()
    });
  });
  context("Accès illégitime à des données", () => {
    it("should add tags and move gauges", () => {
      test_add_tags();
      test_move_gauges();
    });
    it("should valid evaluation", () => {
      validateEval()
    });
    it("should valid modal for evaluation", () => {
      validateModal()
    });
  });
  context("Modification non désirées de données", () => {
    it("should add tags and move gauges", () => {
      test_add_tags();
      test_move_gauges();
    });
    it("should valid evaluation", () => {
      validateEval()
    });
    it("should valid modal for evaluation", () => {
      validateModal();
    });
  });
  context("Disparition de données", () => {
    it("should complete to gether view", () => {
      test_add_tags();
      test_move_gauges();
    });
    it("should valid evaluation", () => {
      validateEval()
    });
    it("should valid modal for evaluation", () => {
      validateModalComplete()
    });
  });
});

/// Phase 2 second itération

describe("Contexte", () => {
  context("Vue d'ensemble", () => {
    it("should acept evaluation", () => {
      acceptEval();
      closeValidationEvaluationModal()
    });
  });
  context("Données, processus et supports", () => {
    it("should acept evaluation", () => {
      acceptEval();
      closeValidationEvaluationModal()
    });
  });
});
describe("Principes Fondamentaux", () => {
  context("Proportionnalité et nécessité", () => {
    it("should acept evaluation", () => {
      acceptMultipleEval();
      closeValidationEvaluationModal()
    });
  });
  context("Mesures protectrices des droits", () => {
    it("should acept evaluation", () => {
      acceptMultipleEval();
      closeValidationEvaluationModal()
    });
  });
});
describe("Risques", () => {
  context("Mesures existantes ou prévues", () => {
    it("should acept evaluation", () => {
      acceptMultipleEval();
      closeValidationEvaluationModal()
    });
  });
  context("Accès illégitime à des données", () => {
    it("should acept evaluation", () => {
      acceptEval();
      closeValidationEvaluationModal();
      redirectMeasureOnAcceptation();
    });
  });
  context("Modification non désirées de données", () => {
    it("should acept evaluation", () => {
      acceptEval();
      closeValidationEvaluationModal();
    });
  });
  context("Disparition de données", () => {
    it("should acept evaluation", () => {
      acceptEval();
      closeCompletedValidationEvaluationModal();
    });
  });
  context("Vue d'ensemble des risques", () => {
    it("should close modal and redirect to context", () => {
      const url = "http://localhost:4200/#/entry/3/section/4/item/3";
      cy.visit(url)
    });
  });
});

// Phase 3 Validation

describe("Validation", () => {
  context("Avis du DPD et des personnes concernées", () => {
    it("should complete DPD", () => {
      validateDPO()
    });
    it ("should valid pia", () => {
      validatePia();
      closeValidationEvaluationModal();
    });
    it ("should show repport", () => {
      cy.get('.pia-entryContentBlock-footer-validationTools > [href="#/summary/3"]').click();
      cy.get(".fa-chevron-left").click();
      validatePia();
    });
    it ("should show repports and plan action dowload", () => {
      cy.get('.pia-entryContentBlock-footer-validationTools > [href="#/summary/3?displayOnlyActionPlan=true"]').click();
      cy.get('[title="Télécharger un export CSV"] > .fa').click();
      cy.get(".fa-chevron-left").click();
      validatePia();
    });
    it ("should show", () => {
      cy.get('.pia-entryContentBlock-footer-validationTools > [href="#/summary/3?displayOnlyActionPlan=true"]').click();
      cy.get('[title="Télécharger un export CSV"] > .fa').click();
      cy.get(".fa-chevron-left").click();
    });
  });
});
function test_writing_on_textarea() {
  cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
    cy.wrap($el).click();
    $el.find("textarea").val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
    cy.wrap($el).parent().wait(250).click();
    expect($el.find('textarea').val().length > 0).to.be.true;
  });
}
function test_add_measure() {
  cy.get('.btn-white > .pia-icons').click();
  cy.get(".pia-measureBlock-title").each(($el, $index, $list) => {
    cy.wrap($el).click();
    cy.wrap($el).find("textarea").type("Measure 1");
  });
  cy.get(".pia-measureBlock-content").each( ($el, $index, $list) => {
    cy.wrap($el).click();
    $el.find("textarea").val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
    cy.wrap($el).parent().wait(250).click();
    expect($el.find('textarea').val().length > 0).to.be.true;
  });
}
function test_add_measure_from_sidebar() {
  cy.get('.pia-knowledgeBaseBlock-item-definition > .btn').first().click();
  cy.get(".pia-measureBlock-content").each(($el, $index, $list) => {
    $el.find("textarea").val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
    cy.wrap($el).parent().wait(250).click();
  });
}
function test_add_tags() {
  cy.get("tag-input-form").each(($el, $index, $list) => {
    cy.wrap($el)
      .find("input")
      .type("tag-1");
    cy.get('.pia-questionBlock').last().click();
    cy.wrap($el)
      .find("input")
      .type("tag-2");
    cy.get('.pia-questionBlock').last().click();
  }).then(function () {
    cy.get('.pia-questionBlock').last().find("input").click().then(function () {
      cy.get('.ng2-menu-item').first().click();
      cy.get('.ng2-menu-item').first().click();
    })
  })
}
function test_move_gauges() {
  cy.get('.pia-gaugeBlock').each(($el, $index, $list) => {
    cy.wrap($el).find("input").invoke('val', 3).trigger('change');
  });
  cy.get(".pia-questionBlock-content").each(($el, $index, $list) => {
    cy.wrap($el).click();
    $el.find("textarea").val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
    cy.wrap($el).parent().wait(250).click();
  });

}
function validateEval() {
  cy.wait(500).get(".pia-entryContentBlock-footer")
    .find(".btn-green").should('have.class', 'btn-active')
    .click();
}

function acceptEval() {
  cy.get(".pia-evaluationBlock")
    .find(".btn-green")
    .click().then(function () {
    cy.get(".pia-entryContentBlock-footer")
      .find(".btn-green").should('have.class', 'btn-active')
      .click();
  })
}

function acceptMultipleEval() {
  cy
    .get(".pia-evaluationBlock")
    .find(".btn-green")
    .each(($el, $index, $list) => {
      cy
        .wait(500)
        .wrap($el)
        .click().wait(250);
  });
  cy
    .wait(500)
    .get(".pia-entryContentBlock-footer")
    .find(".btn-green").should('have.class', 'btn-active')
    .click();
}

function closeCompletedValidationEvaluationModal() {
  cy
    .wait(500)
    .get("#completed-evaluation")
    .invoke("show")
    .find("button")
    .last()
    .click()
    .wait(500)
}
function closeValidationEvaluationModal() {
  cy
    .wait(500)
    .get("#validate-evaluation")
    .invoke("show")
    .find("button")
    .first()
    .click()
    .wait(500)
}

function validateModal() {
  cy
    .wait(500)
    .get("#ask-for-evaluation")
    .find("button")
    .first()
    .click()
    .wait(500);
}

function redirectMeasureOnAcceptation() {
  const url = "http://localhost:4200/#/entry/3/section/3/item/3";
  cy
    .visit(url);
}

function validateDPO() {
  cy.get(".pia-entryContentBlock-content-DPO").each(($el, $index, $list) => {
    cy.wrap($el).find("input").first().type(("DPO Pia"));
    cy.wrap($el).find(".pia-entryContentBlock-content-DPO-treatment").find("label").first().click();
    cy.wrap($el).find("textarea").type("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");

  });
  cy.get(".pia-entryContentBlock-content-people").each(($el, $index, $list) => {
    cy.wrap($el).find("form").first().find("label").first().click();
    cy.wrap($el).find("form").last().find("input").first().type(("DPO Pia"));
    cy.wrap($el).find("form").last().find("label").first().click();
    cy.wrap($el).find("form").last().find("textarea").type("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
    cy.wrap($el).find("form").parent().click();
  });
}

function validatePia() {
  cy.get('.pia-validatePIABlock').find(".btn-green").should('have.class', 'btn-active').click();
  cy.wait(500).get(".pia-entryContentBlock-content-list-confirm").each(($el, $index, $list) => {
    cy.wrap($el).find("label").click();
  }).then(function () {
    cy.get('#pia-simple-validation').click()
  });
}

function testValidatePiaFooterButtons() {

}

function validateModalComplete() {
  cy.wait(500)
    .get("#completed-edition")
    .find("button")
    .first()
    .click()
    .wait(500);
}
