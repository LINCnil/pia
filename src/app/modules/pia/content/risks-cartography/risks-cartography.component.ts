import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { PiaService } from 'src/app/services/pia.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LanguagesService } from 'src/app/services/languages.service';
import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { AnswerService } from 'src/app/services/answer.service';
import { Pia } from 'src/app/models/pia.model';
import { EvaluationService } from 'src/app/services/evaluation.service';

@Component({
  selector: `.app-risks-cartography`,
  templateUrl: './risks-cartography.component.html',
  styleUrls: ['./risks-cartography.component.scss'],
  standalone: false
})
export class RisksCartographyComponent implements OnInit, OnDestroy {
  @Input() pia: Pia = null;
  private subscription: Subscription;
  questions: any[] = [];
  answer: Answer = new Answer();
  answersGauge: any[] = [];
  dataJSON: any;
  risk1Letter;
  risk2Letter;

  constructor(
    private appDataService: AppDataService,
    private translateService: TranslateService,
    public piaService: PiaService,
    public languagesService: LanguagesService,
    private answerService: AnswerService,
    private evaluationService: EvaluationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.risk1Letter = this.translateService.instant(
      'cartography.risk1_access'
    );
    this.risk2Letter = this.translateService.instant(
      'cartography.risk2_modification'
    );
    this.subscription = this.translateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        this.risk1Letter = this.translateService.instant(
          'cartography.risk1_access'
        );
        this.risk2Letter = this.translateService.instant(
          'cartography.risk2_modification'
        );
        this.loadCartography();
      }
    );

    const positions = {
      x: {
        '1': 50,
        '2': 150,
        '3': 250,
        '4': 350
      },
      y: {
        '1': 350,
        '2': 250,
        '3': 150,
        '4': 50
      }
    };

    // JSON data
    this.dataJSON = {
      'risk-access': {
        author: { x: null, y: null },
        evaluator: { x: null, y: null }
      },
      'risk-change': {
        author: { x: null, y: null },
        evaluator: { x: null, y: null }
      },
      'risk-disappearance': {
        author: { x: null, y: null },
        evaluator: { x: null, y: null }
      }
    };

    const dataNav = this.appDataService.dataNav;
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
    this.answerService.getGaugeByPia(this.pia.id).then((entries: any) => {
      this.answersGauge = entries.filter(entry => {
        return entry.data.gauge >= 0;
      });
      this.answersGauge.forEach(answer => {
        const question: any = this.questions.filter(entry => {
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
            this.dataJSON[cartographyKey[0]]['author'][
              axeValue
            ] = pointPosition;
          }
        }
      });
      this.evaluationService
        .getByReference(this.pia.id, '3.2')
        .then(evaluation => {
          if (evaluation && evaluation.gauges) {
            this.dataJSON['risk-access']['evaluator']['y'] =
              positions['y'][evaluation.gauges['x']];
            this.dataJSON['risk-access']['evaluator']['x'] =
              positions['x'][evaluation.gauges['y']];
          }
          this.evaluationService
            .getByReference(this.pia.id, '3.3')
            .then(evaluation2 => {
              if (evaluation2 && evaluation2.gauges) {
                this.dataJSON['risk-change']['evaluator']['y'] =
                  positions['y'][evaluation2.gauges['x']];
                this.dataJSON['risk-change']['evaluator']['x'] =
                  positions['x'][evaluation2.gauges['y']];
              }
              this.evaluationService
                .getByReference(this.pia.id, '3.4')
                .then(evaluation3 => {
                  if (evaluation3 && evaluation3.gauges) {
                    this.dataJSON['risk-disappearance']['evaluator']['y'] =
                      positions['y'][evaluation3.gauges['x']];
                    this.dataJSON['risk-disappearance']['evaluator']['x'] =
                      positions['x'][evaluation3.gauges['y']];
                  }
                  this.loadCartography();
                });
            });
        });
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Loads the risks cartography with author and evalutor choices positioned as dots.
   */
  loadCartography(): void {
    // Instantiation of canvas context
    const canvas = <HTMLCanvasElement>(
      document.getElementById('actionPlanCartography')
    );
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

    if (
      this.dataJSON['risk-access']['author'].x &&
      this.dataJSON['risk-access']['author'].y
    ) {
      // Author dots (red)
      context.beginPath();
      if (localStorage.getItem('increaseContrast') === 'true') {
        context.fillStyle = '#C40288';
      } else {
        context.fillStyle = '#FD4664';
      }
      context.arc(
        this.dataJSON['risk-access']['author'].x + 8,
        this.dataJSON['risk-access']['author'].y,
        7,
        0,
        Math.PI * 2,
        true
      );
      context.fill();
      context.textAlign = 'center';
      context.font = 'bold 1.1rem Roboto, Times, serif';
      context.fillStyle = '#333';
      try {
        context.fillText(
          this.risk1Letter,
          this.dataJSON['risk-access']['author'].x + 8,
          this.dataJSON['risk-access']['author'].y + 20
        );
      } catch (ex) {}
    }

    if (
      this.dataJSON['risk-change']['author'].x &&
      this.dataJSON['risk-change']['author'].y
    ) {
      context.beginPath();
      if (localStorage.getItem('increaseContrast') === 'true') {
        context.fillStyle = '#C40288';
      } else {
        context.fillStyle = '#FD4664';
      }
      context.arc(
        this.dataJSON['risk-change']['author'].x,
        this.dataJSON['risk-change']['author'].y,
        7,
        0,
        Math.PI * 2,
        true
      );
      context.fill();
      context.textAlign = 'center';
      context.font = 'bold 1.1rem Roboto, Times, serif';
      context.fillStyle = '#333';
      try {
        context.fillText(
          this.risk2Letter,
          this.dataJSON['risk-change']['author'].x,
          this.dataJSON['risk-change']['author'].y + 20
        );
      } catch (ex) {}
    }

    if (
      this.dataJSON['risk-disappearance']['author'].x &&
      this.dataJSON['risk-disappearance']['author'].y
    ) {
      context.beginPath();
      if (localStorage.getItem('increaseContrast') === 'true') {
        context.fillStyle = '#C40288';
      } else {
        context.fillStyle = '#FD4664';
      }
      context.arc(
        this.dataJSON['risk-disappearance']['author'].x - 8,
        this.dataJSON['risk-disappearance']['author'].y,
        7,
        0,
        Math.PI * 2,
        true
      );
      context.fill();
      context.textAlign = 'center';
      context.font = 'bold 1.1rem Roboto, Times, serif';
      context.fillStyle = '#333';
      try {
        context.fillText(
          '(D)',
          this.dataJSON['risk-disappearance']['author'].x - 8,
          this.dataJSON['risk-disappearance']['author'].y + 20
        );
      } catch (ex) {}
    }

    // Evaluator dots (blue)
    if (
      this.dataJSON['risk-access']['author'].x &&
      this.dataJSON['risk-access']['author'].y &&
      this.dataJSON['risk-access']['evaluator'].x &&
      this.dataJSON['risk-access']['evaluator'].y
    ) {
      let diameter = 7;
      if (
        this.dataJSON['risk-access']['evaluator'].x ===
          this.dataJSON['risk-access']['author'].x &&
        this.dataJSON['risk-access']['evaluator'].y ===
          this.dataJSON['risk-access']['author'].y
      ) {
        diameter = 10;
        context.globalCompositeOperation = 'destination-over';
      }
      context.beginPath();
      context.fillStyle = '#091C6B';
      context.arc(
        this.dataJSON['risk-access']['evaluator'].x + 8,
        this.dataJSON['risk-access']['evaluator'].y,
        diameter,
        0,
        Math.PI * 2,
        true
      );
      context.fill();
    } else {
      if (
        !this.dataJSON['risk-access']['evaluator'].x &&
        !this.dataJSON['risk-access']['evaluator'].y &&
        this.dataJSON['risk-access']['author'].x &&
        this.dataJSON['risk-access']['author'].y
      ) {
        context.globalCompositeOperation = 'destination-over';
        context.beginPath();
        context.fillStyle = '#091C6B';
        context.arc(
          this.dataJSON['risk-access']['author'].x + 8,
          this.dataJSON['risk-access']['author'].y,
          10,
          0,
          Math.PI * 2,
          true
        );
        context.fill();
      }
    }

    if (
      this.dataJSON['risk-change']['author'].x &&
      this.dataJSON['risk-change']['author'].y &&
      this.dataJSON['risk-change']['evaluator'].x &&
      this.dataJSON['risk-change']['evaluator'].y
    ) {
      let x = this.dataJSON['risk-change']['evaluator'].x;
      let y = this.dataJSON['risk-change']['evaluator'].y;
      let diameter = 7;
      if (
        this.dataJSON['risk-change']['evaluator'].x - 10 ===
          this.dataJSON['risk-change']['author'].x &&
        this.dataJSON['risk-change']['evaluator'].y - 10 ===
          this.dataJSON['risk-change']['author'].y
      ) {
        x = this.dataJSON['risk-change']['evaluator'].x - 10;
        y = this.dataJSON['risk-change']['evaluator'].y - 10;
        diameter = 10;
        context.globalCompositeOperation = 'destination-over';
      }
      context.beginPath();
      context.fillStyle = '#091C6B';
      context.arc(x, y, diameter, 0, Math.PI * 2, true);
      context.fill();
    } else {
      if (
        !this.dataJSON['risk-change']['evaluator'].x &&
        !this.dataJSON['risk-change']['evaluator'].y &&
        this.dataJSON['risk-change']['author'].x &&
        this.dataJSON['risk-change']['author'].y
      ) {
        context.globalCompositeOperation = 'destination-over';
        context.beginPath();
        context.fillStyle = '#091C6B';
        context.arc(
          this.dataJSON['risk-change']['author'].x,
          this.dataJSON['risk-change']['author'].y,
          10,
          0,
          Math.PI * 2,
          true
        );
        context.fill();
      }
    }

    if (
      this.dataJSON['risk-disappearance']['author'].x &&
      this.dataJSON['risk-disappearance']['author'].y &&
      this.dataJSON['risk-disappearance']['evaluator'].x &&
      this.dataJSON['risk-disappearance']['evaluator'].y
    ) {
      let x = this.dataJSON['risk-disappearance']['evaluator'].x;
      let y = this.dataJSON['risk-disappearance']['evaluator'].y;
      let diameter = 7;
      if (
        this.dataJSON['risk-disappearance']['evaluator'].x - 20 ===
          this.dataJSON['risk-disappearance']['author'].x &&
        this.dataJSON['risk-disappearance']['evaluator'].y - 20 ===
          this.dataJSON['risk-disappearance']['author'].y
      ) {
        x = this.dataJSON['risk-disappearance']['evaluator'].x - 28;
        y = this.dataJSON['risk-disappearance']['evaluator'].y - 20;
        diameter = 10;
        context.globalCompositeOperation = 'destination-over';
      }
      context.beginPath();
      context.fillStyle = '#091C6B';
      context.arc(x, y, diameter, 0, Math.PI * 2, true);
      context.fill();
    } else {
      if (
        !this.dataJSON['risk-disappearance']['evaluator'].x &&
        !this.dataJSON['risk-disappearance']['evaluator'].y &&
        this.dataJSON['risk-disappearance']['author'].x &&
        this.dataJSON['risk-disappearance']['author'].y
      ) {
        context.globalCompositeOperation = 'destination-over';
        context.beginPath();
        context.fillStyle = '#091C6B';
        context.arc(
          this.dataJSON['risk-disappearance']['author'].x - 8,
          this.dataJSON['risk-disappearance']['author'].y,
          10,
          0,
          Math.PI * 2,
          true
        );
        context.fill();
      }
    }

    // Gradient color definition for dotted lines
    const grad = context.createLinearGradient(50, 50, 150, 150);

    // Dotted lines params
    context.setLineDash([3, 2]);
    context.lineWidth = 1;

    // Dotted lines
    if (
      this.dataJSON['risk-access']['author'].x &&
      this.dataJSON['risk-access']['author'].y &&
      this.dataJSON['risk-access']['evaluator'].x &&
      this.dataJSON['risk-access']['evaluator'].y &&
      (this.dataJSON['risk-access']['evaluator'].x !==
        this.dataJSON['risk-access']['author'].x ||
        this.dataJSON['risk-access']['evaluator'].y !==
          this.dataJSON['risk-access']['author'].y)
    ) {
      context.beginPath();
      const gradRisk1 = context.createLinearGradient(
        this.dataJSON['risk-access']['author'].x,
        this.dataJSON['risk-access']['author'].y,
        this.dataJSON['risk-access']['evaluator'].x,
        this.dataJSON['risk-access']['evaluator'].y
      );
      gradRisk1.addColorStop(0, '#FD4664');
      gradRisk1.addColorStop(1, '#091C6B');
      context.strokeStyle = gradRisk1;
      this.canvasArrow(
        context,
        this.dataJSON['risk-access']['author'].x + 8,
        this.dataJSON['risk-access']['author'].y,
        this.dataJSON['risk-access']['evaluator'].x + 8,
        this.dataJSON['risk-access']['evaluator'].y
      );
      context.closePath();
      context.stroke();
    }

    if (
      this.dataJSON['risk-change']['author'].x &&
      this.dataJSON['risk-change']['author'].y &&
      this.dataJSON['risk-change']['evaluator'].x &&
      this.dataJSON['risk-change']['evaluator'].y &&
      (this.dataJSON['risk-change']['evaluator'].x - 10 !==
        this.dataJSON['risk-change']['author'].x ||
        this.dataJSON['risk-change']['evaluator'].y - 10 !==
          this.dataJSON['risk-change']['author'].y)
    ) {
      context.beginPath();
      const gradRisk2 = context.createLinearGradient(
        this.dataJSON['risk-change']['author'].x,
        this.dataJSON['risk-change']['author'].y,
        this.dataJSON['risk-change']['evaluator'].x,
        this.dataJSON['risk-change']['evaluator'].y
      );
      gradRisk2.addColorStop(0, '#FD4664');
      gradRisk2.addColorStop(1, '#091C6B');
      context.strokeStyle = gradRisk2;
      this.canvasArrow(
        context,
        this.dataJSON['risk-change']['author'].x,
        this.dataJSON['risk-change']['author'].y,
        this.dataJSON['risk-change']['evaluator'].x,
        this.dataJSON['risk-change']['evaluator'].y
      );
      context.closePath();
      context.stroke();
    }

    if (
      this.dataJSON['risk-disappearance']['author'].x &&
      this.dataJSON['risk-disappearance']['author'].y &&
      this.dataJSON['risk-disappearance']['evaluator'].x &&
      this.dataJSON['risk-disappearance']['evaluator'].y &&
      (this.dataJSON['risk-disappearance']['evaluator'].x - 20 !==
        this.dataJSON['risk-disappearance']['author'].x ||
        this.dataJSON['risk-disappearance']['evaluator'].y - 20 !==
          this.dataJSON['risk-disappearance']['author'].y)
    ) {
      context.beginPath();
      const gradRisk3 = context.createLinearGradient(
        this.dataJSON['risk-disappearance']['author'].x,
        this.dataJSON['risk-disappearance']['author'].y,
        this.dataJSON['risk-disappearance']['evaluator'].x,
        this.dataJSON['risk-disappearance']['evaluator'].y
      );
      gradRisk3.addColorStop(0, '#FD4664');
      gradRisk3.addColorStop(1, '#091C6B');
      context.strokeStyle = gradRisk3;
      this.canvasArrow(
        context,
        this.dataJSON['risk-disappearance']['author'].x - 8,
        this.dataJSON['risk-disappearance']['author'].y,
        this.dataJSON['risk-disappearance']['evaluator'].x,
        this.dataJSON['risk-disappearance']['evaluator'].y
      );
      context.closePath();
      context.stroke();
    }
  }

  /**
   * Draw an arrow between two points.
   * @param {CanvasRenderingContext2D} context - The context.
   * @param {number} fromx - From the position X.
   * @param {number} fromy - From the position Y.
   * @param {number} tox - To the position X.
   * @param {number} toy - To the position Y.
   */
  canvasArrow(
    context: CanvasRenderingContext2D,
    fromx: number,
    fromy: number,
    tox: number,
    toy: number
  ): void {
    const headlength = 16;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(
      tox - headlength * Math.cos(angle - Math.PI / 6),
      toy - headlength * Math.sin(angle - Math.PI / 6)
    );
    context.moveTo(tox, toy);
    context.lineTo(
      tox - headlength * Math.cos(angle + Math.PI / 6),
      toy - headlength * Math.sin(angle + Math.PI / 6)
    );
  }
}
