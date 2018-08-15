import { Component, OnInit, ElementRef, NgZone } from '@angular/core';
import * as d3 from 'd3';

import { Answer } from 'app/entry/entry-content/questions/answer.model';

import { PiaService } from 'app/services/pia.service';
import { AppDataService } from 'app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: `.app-overview-risks`,
  templateUrl: './overview-risks.component.html',
  styleUrls: ['./overview-risks.component.scss'],
  providers: [PiaService]
})
export class OverviewRisksComponent implements OnInit {
  data = [];
  items = [];
  linkFromTo = [];
  svg: any;

  constructor(private _piaService: PiaService,
              private el: ElementRef,
              private _appDataService: AppDataService,
              private _ngZone: NgZone,
              private _translateService: TranslateService) { }

  async ngOnInit() {
    await this.initData();

    this._ngZone.run(() => {
      this.initSvg();
    });
  }

  /**
   * Initialize the data.
   * @private
   * @memberof OverviewRisksComponent
   */
  private async initData() {
    await this._piaService.getPIA();
    const dataTags = [
      {
        id: 1,
        name: this._translateService.instant('overview-risks.potential_impacts'),
        reference_to: [321, 331, 341]
      },
      {
        id: 2,
        name: this._translateService.instant('overview-risks.threat'),
        reference_to: [322, 332, 342]
      },
      {
        id: 3,
        name: this._translateService.instant('overview-risks.sources'),
        reference_to: [323, 333, 343]
      },
      {
        id: 4,
        name: this._translateService.instant('overview-risks.measures'),
        reference_to: [324, 334, 344]
      }
    ];
    for (const dt of dataTags) {
      const tags = {};
      for (const reference_to of dt.reference_to) {
        const answerModel = new Answer();
        await answerModel.getByReferenceAndPia(this._piaService.pia.id, reference_to);
        if (answerModel.data && answerModel.data.list.length > 0) {
          const list = answerModel.data.list;
          for (const l of list) {
            if (!tags[l]) {
              tags[l] = [];
            }
            tags[l].push(reference_to.toString().substring(0, 2));
          }
        }
      }
      this.data.push({
        id: dt.id,
        name: dt.name,
        tags: tags
      });
    }
  }

  /**
   * Initialize the SVG.
   * @private
   * @memberof OverviewRisksComponent
   */
  private async initSvg() {
    const dataNav = await this._appDataService.getDataNav();
    this.svg = d3.select('svg');
    this.svg.attr('viewBox', '0 0 590 800');
    let y = 20;
    for (const a of this.data) {
        let x = 10;
        this.svg.append('text').attr('x', x).attr('y', y).text(a.name).attr('class', 'title');
        x += 20;
        y += 14;
        for (const property in a.tags) {
            if (a.tags.hasOwnProperty(property)) {
              const links = a.tags[property];
              this.svg.append('rect').attr('x', x).attr('y', y).attr('width', '180px').attr('height', '20px')
                  .attr('data-rect-id', a.id).attr('data-links', links).attr('class', 'rect_1');
              let textProperty = property;
              if (property.length >= 30) {
                textProperty = property.substring(0, 27) + '...';
              }
              this.svg.append('text').text(textProperty).attr('x', x + 5).attr('y', y + 15).style('fill', 'white');
              this.svg.append('rect').attr('x', x).attr('y', y).attr('width', '180px').attr('height', '20px')
                  .attr('data-id', a.id).attr('data-to_links', links).attr('class', 'rect_action').on('click', function() {
                    let ids = new Array<string>();
                    const id = a.id;
                    const elements2: any = document.querySelectorAll('[data-rect-id]');
                    const elements3: any = document.querySelectorAll('[data-right]');
                    const elements4: any = document.querySelectorAll('[data-rect-id="' + id + '"]');
                    const elements5: any = document.querySelectorAll('[data-id="' + id + '"]');
                    const elements6: any = document.querySelectorAll('path[data-id]');
                    const previousId = parseInt(localStorage.getItem('d3PreviousIdClicked'), 10);
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
                      ids = ids.reduce(function(aa, bb) {
                          return aa.concat(bb);
                      }, []);
                      const uniqLinks = Array.from(new Set(ids));
                      elements6.forEach(el1 => {
                          el1.classList.add('hide');
                      });
                      for (const link of ids) {
                          document.querySelector('[data-right="' + link + '"]').classList.remove('right_c');
                          const pathElement: any = document.querySelectorAll('path[data-id="' + id + '-' + link + '"]');
                          for (const path of pathElement) {
                              path.classList.remove('hide');
                          }
                      }
                    }
                  });
              this.linkFromTo.push({x: x + 185, y: y + 10, from: a.id, to: links});
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
    dataNav.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.evaluation_with_gauge) {
          const id = section.id.toString() + item.id.toString();
          const x = 380;
          const g = this.svg.append('g').attr('data-right', id);
          g.on('click', function() {
            const previousId = parseInt(localStorage.getItem('d3PreviousIdClicked2'), 10);
            const elements8: any = document.querySelectorAll('[data-right]');
            const elements9: any = document.querySelectorAll('[data-rect-id]');
            const elements10: any = document.querySelectorAll('path');
            const elements11: any = document.querySelectorAll('path[data-id$="' + id + '"]');
            const elements12: any = document.querySelectorAll('rect[data-links*="' + id + '"]');
            if (previousId && previousId > 0 && previousId === parseInt(id, 10)) {
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
              d3.select(this).attr('class', '');
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
          const name = this._translateService.instant(item.title).split('\n');
          const name_1 = name[0];
          const name_2 = name[1];
          g.append('text').attr('x', x).attr('y', y).text(name_1).attr('class', 'c' + id);
          const lft = this.linkFromTo.filter((l) => {
            return l.to.includes(id);
          });
          lft.forEach((bb) => {
            const x1 = bb.x + 100;
            const y1 = bb.y;
            const x2 = x - 4 - 100;
            const y2 = y;
            this.svg.append('path').attr('class', 'fadeIn path_' + id)
                              .attr('data-id', bb.from + '-' + id)
                              .attr('d', 'M' + bb.x + ',' + bb.y + ' C' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + (x - 8)
                                    + ',' + (y + 2));
          });
          y += 12;
          g.append('text').attr('x', x).attr('y', y).text(name_2).attr('class', 'c' + id);
          const questionGauges = item.questions.filter((question) => {
            return question.answer_type === 'gauge';
          });
          this.parseQuestions(questionGauges, g, x, y);
          y += 140;
        }
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
   * @memberof OverviewRisksComponent
   */
  private async parseQuestions(questionGauges, g, x, y) {
    let i = 0;
    const data = [];
    const gauges_value = {
      1: this._translateService.instant('overview-risks.negligible'),
      2: this._translateService.instant('overview-risks.limited'),
      3: this._translateService.instant('overview-risks.important'),
      4: this._translateService.instant('overview-risks.maximal')
    };
    return new Promise((resolve, reject) => {
      questionGauges.forEach(async question => {
        i++;
        const answerModel = new Answer();
        await answerModel.getByReferenceAndPia(this._piaService.pia.id, question.id);
        if (answerModel.data && answerModel.data.gauge > 0) {
          const value = answerModel.data.gauge;
          const name = this._translateService.instant('overview-risks.' + question.cartography);
          y += 25;
          g.append('text').attr('x', x).attr('y', y).text(name + ' : ' + gauges_value[value]).attr('class', 'gauge_prefix');
          y += 10;
          g.append('line').attr('stroke-width', 4).style('stroke', '#eee').attr('x1', x)
            .attr('y1', y).attr('x2', x + 200).attr('y2', y);
          g.append('line').attr('stroke-width', 4).attr('class', 'progress_bar_' + value.toString())
            .attr('x1', x).attr('y1', y).attr('x2', x + ((value * 25) * 2)).attr('y2', y);
        }
        if (questionGauges.length === i) {
          resolve(data);
        }
      });
    });
  }
}
