describe("Context", () => {
  const endPoint = "http://localhost:4200/#/entry/1/section/1/item/1";
  context("typing questions and submit evaluation", () => {
    it("should complete to gether view", () => {
      cy.visit(endPoint);
      cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
        cy.wrap($el).click();
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wrap($el.parent().parent().parent()).click();
        cy.wait(1000).then(() => {
          cy.get(".pia-questionBlock-content").invoke("show").last().click({force: true});
        })
      });
    });
    it("should valid evaluation", () => {
      const $btn = cy.wait(500).get(".btn-green");
      $btn.wait(500).should('have.class', 'btn-active').first().click();
      cy.get("#ask-for-evaluation").invoke("show").find("button").first().click()
    });
    it("should complete datas processes and sup", () => {
      cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
        cy.wrap($el).click();
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wrap($el.parent().parent().parent()).click();
        cy.wait(1000).then(() => {
          cy.get(".pia-questionBlock-content").last().click({force: true});
        })
      });
    });
    it("should valid evaluation", () => {
      const $btn = cy.wait(1000).get(".btn-green");
      $btn.wait(500).should('have.class', 'btn-active').first().click();
      cy.get("#ask-for-evaluation").invoke("show").find("button").first().click()
    });
  });
});
describe("Fundamental principles", () => {
  const endPoint = "http://localhost:4200/#/entry/3/section/2/item/1";
  context("typing questions and submit evaluation", () => {
    it("should complete to gether view", () => {
      cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
        cy.wrap($el).click({force: true});
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wrap($el.parent().parent().parent()).click();
        cy.wait(1000).then(() => {
          cy.get(".pia-questionBlock-content").invoke("show").last().click({force: true});
        })
      });
    });
    it("should valid evaluation", () => {
      const $btn = cy.wait(1000).get(".btn-green");
      $btn.should('have.class', 'btn-active').first().click();
      cy.wait(500).get("#ask-for-evaluation").invoke("show").find("button").first().click()
    });
    it("should complete datas processes and sup", () => {
      cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
        cy.wrap($el).click({force: true});
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wrap($el.parent()).invoke('show').click();
        cy.wait(1000).then(() => {
          cy.wait(500).get(".pia-questionBlock-content").invoke("show").last().click({force: true});
        })
      });
    });
    it("should valid evaluation", () => {
      const $btn = cy.wait(1000).get(".btn-green");
      $btn.should('have.class', 'btn-active').wait(500).first().click();
      cy.wait(1000).get("#ask-for-evaluation").invoke("show").find("button").first().click()
    });
  });
});
describe("Risks", () => {
  const endPoint = "http://localhost:4200/#/entry/1/section/3/item/1";
  context("typing measures and submit evaluation", () => {
    it("should add measure", () => {
      cy.visit(endPoint);
      const $btn = cy.wait(500).get(".btn-addMeasure");
      $btn.should('have.class', 'btn-addMeasure').first().click();
      cy.get(".pia-measureBlock").each(($el, $index, $list) => {
        cy.wrap($el).get(".pia-measureBlock-title").find("textarea").type("New measure title");
      });
      cy.get(".pia-measureBlock-content").each(($el, $index, $list) => {
        cy.wrap($el).click();
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wait(500).wrap($el).parent().parent().click();
      })
    });
    it('should add existing measure from right ', () => {
      cy.get(".pia-knowledgeBaseBlock-item-definition").find("button").first().click();
      cy.wait(500).get(".pia-measureBlock-content").each(($el, $index, $list) => {
        cy.wrap($el).click();
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wait(500).wrap($el).parent().parent().click();
      })
    });
    it("should valid evaluation", () => {
      const $btn = cy.get(".btn-green");
      $btn.wait(500).should('have.class', 'btn-active').first().click();
      cy.wait(500).get("#ask-for-evaluation").invoke("show").find("button").first().click()
    });
    it("should add tag", () => {
      cy.get("tag-input-form").each(($el, $index, $list) => {
        cy.wrap($el.find("input")).type("tag-1");
      });
      cy.get("tag-input-form").each( ($el, $index, $list) => {
        cy.wrap($el.find("input")).type("tag-2");
      });
      cy.get("tag-input").last().find("input").clear().click();
      cy.wait(500).get(".ng2-menu-item").first().invoke("show").click({force: true});
      cy.get("tag-input").last().find("input").click();
    });
    it("should move gauges", () => {
      cy.get('.pia-gaugeBlock').each(($el, $index, $list) => {
        cy.wrap($el.find("input")).as('range').invoke('val', 3).trigger('change');
        cy.get(".pia-questionBlock-content").first().click({force: true});
      });
      cy.get('.pia-gaugeBlock').each(($el, $index, $list) => {
        cy.wrap($el.find("input")).as('range').invoke('val', 3).trigger('change');
        cy.get(".pia-questionBlock-content").first().click({force: true});
      });
    })
    it("should add question", () => {
      cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
        cy.wrap($el.find(".pia-questionBlock-contentText")).click({force: true});
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wrap($el).click({force: true});
        cy.wrap($el).click({force: true});
      });
    });
    it("should valid evaluation", () => {
      const $btn = cy.get(".btn-green");
      $btn.wait(500).should('have.class', 'btn-active').first().click();
      cy.wait(500).get("#ask-for-evaluation").invoke("show").find("button").first().click()
    });
    it("should add tag", () => {
      cy.get("tag-input").each(($el, $index, $list) => {
        cy.wrap($el).click();
        cy.wrap($el.find("input")).type("tag-1");
      });
      cy.get("tag-input").each( ($el, $index, $list) => {
        cy.wrap($el).click();
        cy.wrap($el.find("input")).type("tag-2");
      });
      cy.get("tag-input").last().find("input").clear().click();
      cy.wait(500).get(".ng2-menu-item").first().invoke("show").click({force: true});
      cy.get("tag-input").last().find("input").click();
    });
    it("should move gauges", () => {
      cy.get('.pia-gaugeBlock').each(($el, $index, $list) => {
        cy.wrap($el.find("input")).as('range').invoke('val', 3).trigger('change');
        cy.get(".pia-questionBlock-content").first().click({force: true});
      });
      cy.get('.pia-gaugeBlock').each(($el, $index, $list) => {
        cy.wrap($el.find("input")).as('range').invoke('val', 3).trigger('change');
        cy.get(".pia-questionBlock-content").first().click({force: true});
      });
    });
    it("should add question", () => {
      cy.get(".pia-questionBlock-content").each( ($el, $index, $list) => {
        cy.wrap($el.find(".pia-questionBlock-contentText")).click({force: true});
        $el.first().children().val("Nam tincidunt sem vel pretium scelerisque. Aliquam tincidunt commodo magna, vitae rutrum massa. Praesent lobortis porttitor gravida. Fusce nulla libero, feugiat eu sodales at, semper ac diam. Morbi sit amet luctus libero, eu sagittis neque");
        cy.wrap($el).click({force: true});
        cy.wrap($el).click({force: true});
      });
    });
  });
});
before("Purge Pia before run", () => {
  //indexedDB.deleteDatabase("pia");
  indexedDB.deleteDatabase("evaluation");
  indexedDB.deleteDatabase("structure");
  indexedDB.deleteDatabase("comment");
  indexedDB.deleteDatabase("measure");
  indexedDB.deleteDatabase("answer");
});

