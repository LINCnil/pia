import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Answer } from 'src/app/entry/entry-content/questions/answer.model';
import { Evaluation } from 'src/app/entry/entry-content/evaluations/evaluation.model';

import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: `.app-risks-cartography`,
  templateUrl: './risks-cartography.component.html',
  styleUrls: ['./risks-cartography.component.scss']
})
export class RisksCartographyComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  questions: any[] = [];
  answer: Answer = new Answer();
  answersGauge: any[] = [];
  dataJSON: any;
  risk1Letter;
  risk2Letter;
  risk3Letter;
  dotColor1 = '#FD4644'
  altColor1 = '#C40288'
  dotColor2 = '#000000'
  dotColor3 = '#4366ef'

  constructor(private http: HttpClient,
              private _appDataService: AppDataService,
              private _translateService: TranslateService,
              public _piaService: PiaService) { }

  async ngOnInit() {
    this.risk1Letter = this._translateService.instant('cartography.risk1_access');
    this.risk2Letter = this._translateService.instant('cartography.risk2_modification');
    this.risk3Letter = this._translateService.instant('cartography.risk3_disappearance');
    this.subscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.risk1Letter = this._translateService.instant('cartography.risk1_access');
      this.risk2Letter = this._translateService.instant('cartography.risk2_modification');
      this.risk3Letter = this._translateService.instant('cartography.risk3_disappearance');
      this.loadCartography();
    });

    const positions = {
      x: {
        '1': 50,
        '2': 150,
        '3': 250,
        '4': 350,
      },
      y: {
        '1': 350,
        '2': 250,
        '3': 150,
        '4': 50,
      }
    }

    // JSON data
    this.dataJSON = {
      'risk-access': {
        'pre': { x: null, y: null },
        'author': { x: null, y: null },
        'evaluator': { x: null, y: null }
      },
      'risk-change': {
        'pre': { x: null, y: null },
        'author': { x: null, y: null },
        'evaluator': { x: null, y: null }
      },
      'risk-disappearance': {
        'pre': { x: null, y: null },
        'author': { x: null, y: null },
        'evaluator': { x: null, y: null }
      }
    };

    const dataNav = this._appDataService.dataNav;
    dataNav.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        if (item.questions) {
          item.questions.forEach(question => {
            if (question.answer_type === 'gauge') {
              this.questions.push(question);
            }
          });
        }
      });
    });
    this.answer.getGaugeByPia(this._piaService.pia.id).then((entries: any) => {
      this.answersGauge = entries.filter((entry) => {
        return entry.data.gauge >= 0;
      });
      this.answersGauge.forEach(answer => {
        const question: any = this.questions.filter((entry) => {
          return entry.id.toString() === answer.reference_to.toString();
        });
        if (question[0]) {
          const cartographyKey = question[0].cartography.split('_');
          if (answer.data.gauge > 0) {
            let axeValue;
            axeValue = cartographyKey[1] === 'x' ? 'y' : 'x';
            let pointPosition = positions[axeValue][answer.data.gauge];
            if (cartographyKey[0] === 'risk-change') {
              pointPosition -= 10;
            } else if (cartographyKey[0] === 'risk-disappearance') {
              pointPosition -= 20;
            }
            if (cartographyKey[0] === 'pre-access') {
              this.dataJSON['risk-access']['pre'][axeValue] = pointPosition;
            } else if (cartographyKey[0] === 'pre-change') {
              this.dataJSON['risk-change']['pre'][axeValue] = pointPosition - 10;
            } else if (cartographyKey[0] === 'pre-disappearance') {
              this.dataJSON['risk-disappearance']['pre'][axeValue] = pointPosition - 20;
            } else {
              this.dataJSON[cartographyKey[0]]['author'][axeValue] = pointPosition;
            }
          }
        }
      });
      const evaluation = new Evaluation();
      evaluation.getByReference(this._piaService.pia.id, '3.2').then(() => {
        if (evaluation.gauges) {
          this.dataJSON['risk-access']['evaluator']['y'] = positions['y'][evaluation.gauges['x']];
          this.dataJSON['risk-access']['evaluator']['x'] = positions['x'][evaluation.gauges['y']];
        }
        const evaluation2 = new Evaluation();
        evaluation2.getByReference(this._piaService.pia.id, '3.3').then(() => {
          if (evaluation2.gauges) {
            this.dataJSON['risk-change']['evaluator']['y'] = positions['y'][evaluation2.gauges['x']];
            this.dataJSON['risk-change']['evaluator']['x'] = positions['x'][evaluation2.gauges['y']];
          }
          const evaluation3 = new Evaluation();
          evaluation3.getByReference(this._piaService.pia.id, '3.4').then(() => {
            if (evaluation3.gauges) {
              this.dataJSON['risk-disappearance']['evaluator']['y'] = positions['y'][evaluation3.gauges['x']];
              this.dataJSON['risk-disappearance']['evaluator']['x'] = positions['x'][evaluation3.gauges['y']];
            }
            this.loadCartography();
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  drawPreDot(context: any, risk: string) {
    // Dot1
    if (this.dataJSON[risk]['pre'].x && 
        this.dataJSON[risk]['pre'].y && 
        this.dataJSON[risk]['author'].x && 
        this.dataJSON[risk]['author'].y) {
      let diameter = 8;
      // Is the location the same for Dot1 and Dot2?
      if (this.dataJSON[risk]['author'].x  === this.dataJSON[risk]['pre'].x &&
          this.dataJSON[risk]['author'].y  === this.dataJSON[risk]['pre'].y) {
        diameter = 6;
        context.globalCompositeOperation = 'destination-over';
      }
      // Draw Dot1
      context.beginPath();
      if (localStorage.getItem('increaseContrast') === 'true') {
        context.fillStyle = this.altColor1;
      } else {
        context.fillStyle = this.dotColor1;
      }
      context.arc(this.dataJSON[risk]['pre'].x, 
                  this.dataJSON[risk]['pre'].y, diameter, 0, Math.PI * 2, true);
      context.fill(); 
    } else {
      if (this.dataJSON[risk]['author'].x &&
          this.dataJSON[risk]['author'].y &&
          !this.dataJSON[risk]['pre'].x &&
          !this.dataJSON[risk]['pre'].y) {
        context.globalCompositeOperation = 'destination-over';
        context.beginPath();
        context.fillStyle = this.dotColor1;
        // Draw Dot1 where Dot2 is, but smaller
        context.arc(this.dataJSON[risk]['author'].x,
                    this.dataJSON[risk]['author'].y, 6, 0, Math.PI * 2, true);
        context.fill();
      }
    }
  }

  drawRiskDot(context: any, risk: string, riskLetter: any) {
    // Dot2
    if (this.dataJSON[risk]['author'].x && this.dataJSON[risk]['author'].y) {
      context.beginPath();
      context.fillStyle = this.dotColor2;
      context.arc(this.dataJSON[risk]['author'].x,
                  this.dataJSON[risk]['author'].y, 8, 0, Math.PI * 2, true);
      context.fill();
      context.textAlign = 'center';
      context.font = 'bold 1.1rem Roboto, Times, serif';
      // Add letter in parentheses under Dot2
      try {
        context.fillStyle = '#333';
        context.fillText(riskLetter,
                    this.dataJSON[risk]['author'].x,
                    this.dataJSON[risk]['author'].y + 20);
      } catch (ex) {}
    }
  }

  drawEvalDot(context: any, risk: string, offset: number) {
    // Dot3
    if (this.dataJSON[risk]['author'].x &&
        this.dataJSON[risk]['author'].y &&
        this.dataJSON[risk]['evaluator'].x &&
        this.dataJSON[risk]['evaluator'].y) {
      let diameter = 8;
      if (this.dataJSON[risk]['evaluator'].x - offset === this.dataJSON[risk]['author'].x &&
          this.dataJSON[risk]['evaluator'].y - offset === this.dataJSON[risk]['author'].y) {
        diameter = 10;
        context.globalCompositeOperation = 'destination-over';
      }
      context.beginPath();
      context.fillStyle = this.dotColor3;
      context.arc(this.dataJSON[risk]['evaluator'].x - offset, 
                  this.dataJSON[risk]['evaluator'].y - offset, diameter, 0, Math.PI * 2, true);
      context.fill(); 
    } else {
      if (!this.dataJSON[risk]['evaluator'].x &&
          !this.dataJSON[risk]['evaluator'].y &&
          this.dataJSON[risk]['author'].x &&
          this.dataJSON[risk]['author'].y) {
        context.globalCompositeOperation = 'destination-over';
        context.beginPath();
        context.fillStyle = this.dotColor3;
        // Draw Dot3 where Dot2 is, but bigger
        context.arc(this.dataJSON[risk]['author'].x,
                    this.dataJSON[risk]['author'].y, 10, 0, Math.PI * 2, true);
        context.fill();
      }
    }
  }

  drawDotLine(context: any, risk: string, offset: number) {
    // Line from Dot1 to Dot2
    if (this.dataJSON[risk]['pre'].x && this.dataJSON[risk]['pre'].y &&
        this.dataJSON[risk]['author'].x && this.dataJSON[risk]['author'].y &&
        (this.dataJSON[risk]['pre'].x !== this.dataJSON[risk]['author'].x ||
        this.dataJSON[risk]['pre'].y !== this.dataJSON[risk]['author'].y)) {
      context.beginPath();
      const gradRisk1 = context.createLinearGradient(this.dataJSON[risk]['pre'].x,
                                                    this.dataJSON[risk]['pre'].y,
                                                    this.dataJSON[risk]['author'].x,
                                                    this.dataJSON[risk]['author'].y);
      gradRisk1.addColorStop(0, this.dotColor1);
      gradRisk1.addColorStop(1, this.dotColor2);
      context.strokeStyle = gradRisk1;
      this.canvasArrow(context, 
                      this.dataJSON[risk]['pre'].x,
                      this.dataJSON[risk]['pre'].y,
                      this.dataJSON[risk]['author'].x,
                      this.dataJSON[risk]['author'].y);
      context.closePath();
      context.stroke();
    } 

    // Line from Dot2 to Dot3
    if (this.dataJSON[risk]['author'].x && this.dataJSON[risk]['author'].y &&
        this.dataJSON[risk]['evaluator'].x && this.dataJSON[risk]['evaluator'].y &&
        (this.dataJSON[risk]['evaluator'].x - offset !== this.dataJSON[risk]['author'].x ||
        this.dataJSON[risk]['evaluator'].y - offset !== this.dataJSON[risk]['author'].y)) {
      context.beginPath();
      const gradRisk2 = context.createLinearGradient(this.dataJSON[risk]['author'].x,
                                                    this.dataJSON[risk]['author'].y,
                                                    this.dataJSON[risk]['evaluator'].x,
                                                    this.dataJSON[risk]['evaluator'].y);
      gradRisk2.addColorStop(0, this.dotColor2);
      gradRisk2.addColorStop(1, this.dotColor3);
      context.strokeStyle = gradRisk2;
      this.canvasArrow(context, 
                      this.dataJSON[risk]['author'].x,
                      this.dataJSON[risk]['author'].y,
                      this.dataJSON[risk]['evaluator'].x - offset,
                      this.dataJSON[risk]['evaluator'].y - offset);
      context.closePath();
      context.stroke();
    } 
  }

  /**
   * Loads the risks cartography with author and evalutor choices positioned as dots.
   */
  loadCartography() {
      // Instanciation of canvas context
      const canvas = <HTMLCanvasElement>document.getElementById('actionPlanCartography');
      const context = canvas.getContext('2d');

      // Clearing canvas if changing languages
      context.clearRect(0, 0, canvas.width, canvas.height);

      // White grid creation
      context.beginPath();
      context.moveTo(0, 300);
      context.lineTo(100, 300);
      context.lineTo(100, 400);
      context.moveTo(0, 200);
      context.lineTo(200, 200);
      context.lineTo(200, 400);
      context.moveTo(0, 100);
      context.lineTo(300, 100);
      context.lineTo(300, 400);
      context.lineWidth = 2;
      context.strokeStyle = 'white';
      context.stroke();

      // Illegitimate access to data: Dot 1, 2 & 3
      this.drawPreDot(context, 'risk-access');
      this.drawRiskDot(context, 'risk-access', this.risk1Letter);
      this.drawEvalDot(context, 'risk-access', 0);
      
      // Unwanted modification of data: Dot 1, 2 & 3
      this.drawPreDot(context, 'risk-change');
      this.drawRiskDot(context, 'risk-change', this.risk2Letter);
      this.drawEvalDot(context, 'risk-change', 10);

      // Data disappearance: Dot 1, 2 & 3
      this.drawPreDot(context, 'risk-disappearance');
      this.drawRiskDot(context, 'risk-disappearance', this.risk3Letter);
      this.drawEvalDot(context, 'risk-disappearance', 20);

      // Gradient color definition for dotted lines
      const grad = context.createLinearGradient(50, 50, 150, 150);

      // Dotted lines params
      context.setLineDash([3, 2]);
      context.lineWidth = 1;

      this.drawDotLine(context, 'risk-access', 0);
      this.drawDotLine(context, 'risk-change', 10);
      this.drawDotLine(context, 'risk-disappearance', 20);
  }


  /**
   * Draw an arrow between two points.
   * @param {CanvasRenderingContext2D} context - The context.
   * @param {number} fromx - From the position X.
   * @param {number} fromy - From the position Y.
   * @param {number} tox - To the position X.
   * @param {number} toy - To the position Y.
   */
  canvasArrow(context: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
    const headlength = 16;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlength * Math.cos(angle - Math.PI / 6), toy - headlength * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlength * Math.cos(angle + Math.PI / 6), toy - headlength * Math.sin(angle + Math.PI / 6));
  }

}
