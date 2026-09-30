import { Component, OnInit, NgZone, Input } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';

import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Answer } from 'src/app/models/answer.model';
import { AnswerService } from 'src/app/services/answer.service';
import { Pia } from 'src/app/models/pia.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: `.app-overview-risks`,
  templateUrl: './overview-risks.component.html',
  styleUrls: ['./overview-risks.component.scss'],
  standalone: false
})
export class OverviewRisksComponent implements OnInit {
  @Input() pia: Pia = null;
  data = [];
  items = [];
  linkFromTo = [];
  svg: any;
  subscription: Subscription;

  constructor(
    private appDataService: AppDataService,
    private ngZone: NgZone,
    private translateService: TranslateService,
    private answerService: AnswerService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initData().then(() => {
      this.ngZone.run(async () => {
        await this.initSvg();
      });
    });

    this.subscription = this.translateService.onLangChange.subscribe(
      async (event: LangChangeEvent) => {
        this.ngZone.run(async () => {
          this.svg.selectAll('*').remove();
          await this.initData().then(() => {
            this.ngZone.run(async () => {
              await this.initSvg();
            });
          });
        });
      }
    );
  }

  /**
   * Initialize the data.
   * @private
   */
  private async initData(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.data = [];
      const dataTags = [
        {
          id: 1,
          key: 'overview-risks.potential_impacts',
          reference_to: [321, 331, 341]
        },
        {
          id: 2,
          key: 'overview-risks.threat',
          reference_to: [322, 332, 342]
        },
        {
          id: 3,
          key: 'overview-risks.sources',
          reference_to: [323, 333, 343]
        },
        {
          id: 4,
          key: 'overview-risks.measures',
          reference_to: [324, 334, 344]
        }
      ];
      for (const dt of dataTags) {
        const tags = {};
        const name = await this.translateService.get(dt.key).toPromise();

        for (const reference_to of dt.reference_to) {
          await this.answerService
            .getByReferenceAndPia(this.pia.id, reference_to)
            .then((result: Answer) => {
              if (
                result &&
                result.data &&
                result.data.list &&
                result.data.list.length > 0
              ) {
                const list = result.data.list;
                for (const l of list) {
                  if (!tags[l]) {
                    tags[l] = [];
                  }
                  tags[l].push(reference_to.toString().substring(0, 2));
                }
              }
            });
        }
        this.data.push({
          id: dt.id,
          name,
          tags
        });
      }

      resolve(this.data);
    });
  }

  /**
   * Initialize the SVG.
   * @private
   */
  private async initSvg(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const svgBlock = document.getElementById('risksOverviewSvg');
      const dataNav = this.appDataService.dataNav;
      this.svg = null;
      this.linkFromTo = [];
      this.svg = d3.select('#risksOverviewSvg');
      this.svg.attr('viewBox', '0 0 590 800');
      let y = 20;
      for (const a of this.data) {
        let x = 10;
        this.svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .text(a.name)
          .attr('class', 'title');
        x += 20;
        y += 14;
        for (const property in a.tags) {
          if (a.tags.hasOwnProperty(property)) {
            const links = a.tags[property];
            this.svg
              .append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', '180px')
              .attr('height', '20px')
              .attr('data-rect-id', a.id)
              .attr('data-links', links)
              .attr('class', 'rect_1');
            let textProperty = property;
            if (property.length >= 30) {
              textProperty = property.substring(0, 27) + '...';
            }
            this.svg
              .append('text')
              .text(textProperty)
              .attr('x', x + 5)
              .attr('y', y + 15)
              .style('fill', 'white');
            this.svg
              .append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', '180px')
              .attr('height', '20px')
              .attr('data-id', a.id)
              .attr('data-to_links', links)
              .attr('class', 'rect_action')
              .on('click', () => {
                let ids = new Array<string>();
                const id = a.id;
                const elements2: any = document.querySelectorAll(
                  '[data-rect-id]'
                );
                const elements3: any = document.querySelectorAll(
                  '[data-right]'
                );
                const elements4: any = document.querySelectorAll(
                  '[data-rect-id="' + id + '"]'
                );
                const elements5: any = document.querySelectorAll(
                  '[data-id="' + id + '"]'
                );
                const elements6: any = document.querySelectorAll(
                  'path[data-id]'
                );
                const previousId = parseInt(
                  localStorage.getItem('d3PreviousIdClicked'),
                  10
                );
                if (previousId && previousId > 0 && previousId === a.id) {
                  localStorage.removeItem('d3PreviousIdClicked');
                  elements2.forEach(el3 => {
                    el3.classList.remove('rect_2');
                    el3.classList.add('rect_1');
                  });
                  elements3.forEach(el3 => {
                    el3.classList.remove('right_c');
                  });
                  elements6.forEach(el1 => {
                    el1.classList.remove('hide');
                  });
                } else {
                  localStorage.setItem('d3PreviousIdClicked', a.id);
                  elements2.forEach(el3 => {
                    el3.classList.remove('rect_1');
                    el3.classList.add('rect_2');
                  });
                  elements3.forEach(el3 => {
                    el3.classList.add('right_c');
                  });
                  elements4.forEach(el3 => {
                    el3.classList.remove('rect_2');
                    el3.classList.add('rect_1');
                  });
                  elements5.forEach(el3 => {
                    ids.push(el3.dataset.to_links.split(','));
                  });
                  ids = ids.reduce((aa, bb) => {
                    return aa.concat(bb);
                  }, []);
                  const uniqLinks = Array.from(new Set(ids));
                  elements6.forEach(el1 => {
                    el1.classList.add('hide');
                  });
                  for (const link of ids) {
                    document
                      .querySelector('[data-right="' + link + '"]')
                      .classList.remove('right_c');
                    const pathElement: any = document.querySelectorAll(
                      'path[data-id="' + id + '-' + link + '"]'
                    );
                    for (const path of pathElement) {
                      path.classList.remove('hide');
                    }
                  }
                }
              });
            this.linkFromTo.push({
              x: x + 185,
              y: y + 10,
              from: a.id,
              to: links
            });
            y += 22;
          }
        }
        let viewBoxHeight = y + 30;
        if (viewBoxHeight < 600) {
          viewBoxHeight = 600;
        }
        this.svg.attr('viewBox', '0 0 590 ' + viewBoxHeight);
        y += 50;
      }

      y = 140;
      dataNav.sections.forEach((section: any) => {
        section.items.forEach((item: any) => {
          if (item.evaluation_with_gauge) {
            const id = section.id.toString() + item.id.toString();
            const x = 380;
            const g = this.svg.append('g').attr('data-right', id);
            g.on('click', event => {
              const previousId = parseInt(
                localStorage.getItem('d3PreviousIdClicked2'),
                10
              );
              const elements8: any = svgBlock.querySelectorAll('[data-right]');
              const elements9: any = svgBlock.querySelectorAll(
                '[data-rect-id]'
              );
              const elements10: any = svgBlock.querySelectorAll('path');
              const elements11: any = svgBlock.querySelectorAll(
                'path[data-id$="' + id + '"]'
              );
              const elements12: any = svgBlock.querySelectorAll(
                'rect[data-links*="' + id + '"]'
              );
              if (
                previousId &&
                previousId > 0 &&
                previousId === parseInt(id, 10)
              ) {
                localStorage.removeItem('d3PreviousIdClicked2');
                elements8.forEach(el3 => {
                  el3.classList.remove('right_c');
                });
                elements9.forEach(el3 => {
                  el3.classList.remove('rect_2');
                  el3.classList.add('rect_1');
                });
                elements10.forEach(el3 => {
                  el3.classList.remove('hide');
                });
              } else {
                localStorage.setItem('d3PreviousIdClicked2', id);
                elements8.forEach(el3 => {
                  el3.classList.add('right_c');
                });
                event.target.parentNode.classList.remove('right_c');
                elements9.forEach(el3 => {
                  el3.classList.remove('rect_1');
                  el3.classList.add('rect_2');
                });
                elements10.forEach(el3 => {
                  el3.classList.add('hide');
                });
                elements11.forEach(el3 => {
                  el3.classList.remove('hide');
                });
                elements12.forEach(el3 => {
                  el3.classList.remove('rect_2');
                  el3.classList.add('rect_1');
                });
              }
            });
            const name = this.translateService.instant(item.title).split('\n');
            const name_1 = name[0];
            const name_2 = name[1];
            g.append('text')
              .attr('x', x)
              .attr('y', y)
              .text(name_1)
              .attr('class', 'c' + id);
            const lft = this.linkFromTo.filter(l => {
              return l.to.includes(id);
            });
            lft.forEach(bb => {
              const x1 = bb.x + 100;
              const y1 = bb.y;
              const x2 = x - 4 - 100;
              const y2 = y;
              this.svg
                .append('path')
                .attr('class', 'fadeIn path_' + id)
                .attr('data-id', bb.from + '-' + id)
                .attr(
                  'd',
                  'M' +
                    bb.x +
                    ',' +
                    bb.y +
                    ' C' +
                    x1 +
                    ',' +
                    y1 +
                    ' ' +
                    x2 +
                    ',' +
                    y2 +
                    ' ' +
                    (x - 8) +
                    ',' +
                    (y + 2)
                );
            });
            y += 12;
            g.append('text')
              .attr('x', x)
              .attr('y', y)
              .text(name_2)
              .attr('class', 'c' + id);
            const questionGauges = item.questions.filter(question => {
              return question.answer_type === 'gauge';
            });
            this.parseQuestions(questionGauges, g, x, y);
            y += 140;
          }
        });
      });
    });
  }

  /**
   * Parse the questions.
   * @private
   * @param {any} questionGauges - Any questions gauges.
   * @param {any} g - SVG element.
   * @param {any} x - Position X.
   * @param {any} y - Position Y.
   * @returns {Promise}
   */
  private async parseQuestions(questionGauges, g, x, y): Promise<any[]> {
    let i = 0;
    const data = [];
    const gauges_value = {
      1: this.translateService.instant('overview-risks.negligible'),
      2: this.translateService.instant('overview-risks.limited'),
      3: this.translateService.instant('overview-risks.important'),
      4: this.translateService.instant('overview-risks.maximal')
    };
    return new Promise((resolve, reject) => {
      questionGauges.forEach(async question => {
        i++;
        this.answerService
          .getByReferenceAndPia(this.pia.id, question.id)
          .then((result: Answer) => {
            if (result && result.data && result.data.gauge > 0) {
              const value = result.data.gauge;
              const name = this.translateService.instant(
                'overview-risks.' + question.cartography
              );
              y += 25;
              g.append('text')
                .attr('x', x)
                .attr('y', y)
                .text(name + ' : ' + gauges_value[value])
                .attr('class', 'gauge_prefix');
              y += 10;
              g.append('line')
                .attr('stroke-width', 4)
                .style('stroke', '#eee')
                .attr('x1', x)
                .attr('y1', y)
                .attr('x2', x + 200)
                .attr('y2', y);
              g.append('line')
                .attr('stroke-width', 4)
                .attr('class', 'progress_bar_' + value.toString())
                .attr('x1', x)
                .attr('y1', y)
                .attr('x2', x + value * 25 * 2)
                .attr('y2', y);
            }
            if (questionGauges.length === i) {
              resolve(data);
            }
          });
      });
    });
  }
}
