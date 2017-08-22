import { Component, OnInit, Input } from '@angular/core';
import { Answer } from 'app/entry/entry-content/questions/answer.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';
import { Http } from '@angular/http';

@Component({
  selector: 'app-risks-cartography',
  templateUrl: './risks-cartography.component.html',
  styleUrls: ['./risks-cartography.component.scss']
})
export class RisksCartographyComponent implements OnInit {

  questions: any[] = [];
  answer: Answer = new Answer();
  answersGauge: any[] = [];
  @Input() pia: any;
  dataJSON: any;

  constructor(private http: Http) { }

  ngOnInit() {

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
        'author': { x: null, y: null },
        'evaluator': { x: null, y: null }
      },
      'risk-change': {
        'author': { x: null, y: null },
        'evaluator': { x: null, y: null }
      },
      'risk-disappearance': {
        'author': { x: null, y: null },
        'evaluator': { x: null, y: null }
      }
    };

    this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
      data.sections.forEach(section => {
        section.items.forEach(item => {
          if (item.questions) {
            item.questions.forEach(question => {
              if (question.answer_type === 'gauge') {
                this.questions.push(question);
              }
            });
          }
        });
      });
      this.answer.getGaugeByPia(this.pia.id).then((entries: any) => {
        this.answersGauge = entries.filter((entry) => {
          return entry.data.gauge >= 0;
        });
        this.answersGauge.forEach(answer => {
          const question: any = this.questions.filter((entry) => {
            return entry.id === answer.reference_to;
          });
          if (question[0]) {
            const cartographyKey = question[0].cartography.split('_');
            if (answer.data.gauge > 0) {
              let axeValue;
              axeValue = cartographyKey[1] === 'x' ? 'y' : 'x';
              let pointPosition = positions[axeValue][answer.data.gauge];
              if (cartographyKey[0] === 'risk-access') {
                pointPosition -= 10;
              } else if (cartographyKey[0] === 'risk-change') {
                pointPosition -= 20;
              } else if (cartographyKey[0] === 'risk-disappearance') {
                pointPosition -= 30;
              }
              this.dataJSON[cartographyKey[0]]['author'][axeValue] = pointPosition;
            }
          }
        });
        const evaluation = new Evaluation();
        evaluation.getByReference(this.pia.id, '3.2').then(() => {
          if (evaluation.gauges) {
            this.dataJSON['risk-access']['evaluator']['y'] = positions['y'][evaluation.gauges['x']] + 10;
            this.dataJSON['risk-access']['evaluator']['x'] = positions['x'][evaluation.gauges['y']] + 10;
          }
          const evaluation2 = new Evaluation();
          evaluation2.getByReference(this.pia.id, '3.3').then(() => {
            if (evaluation2.gauges) {
              this.dataJSON['risk-change']['evaluator']['y'] = positions['y'][evaluation2.gauges['x']] + 20;
              this.dataJSON['risk-change']['evaluator']['x'] = positions['x'][evaluation2.gauges['y']] + 20;
            }
            const evaluation3 = new Evaluation();
            evaluation3.getByReference(this.pia.id, '3.4').then(() => {
              if (evaluation3.gauges) {
                this.dataJSON['risk-disappearance']['evaluator']['y'] = positions['y'][evaluation3.gauges['x']] + 30;
                this.dataJSON['risk-disappearance']['evaluator']['x'] = positions['x'][evaluation3.gauges['y']] + 30;
              }
              this.loadCartography();
            });
          });
        });
      });
    });
  }



  /**
   * Loads the risks cartography with author and evalutor choices positioned as dots.
   */
  loadCartography() {

      /* /!\ TO READ :
      *
      * Canvas size is 400 x 400
      * Canvas has 4 lines and 4 columns (numbered from 1 to 4, from top to bottom and from left to right)
      *
      * 16 blocks, each having a size of 100 x 100
      *
      * /!\ Dots placement in a block is the following :
      * dot x position : block x position + 20
      * dot y position : block y position + 80
      *
      * Example with a block (line 3, column 3) :
      * Block position is x = 200 and y = 200
      * Then the dot position will be x = 220 and y = 280
      *
      * /!\  For texts under evaluation dots, they are displayed this way :
      * text x position : dot x position
      * text y position : dot y position + 20
      * For the second text line (under first text), add 12 additionnal pixels to text y position
      *
      */

      // Instanciation of canvas context
      const canvas = <HTMLCanvasElement>document.getElementById('actionPlanCartography');
      const context = canvas.getContext('2d');

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

      if (this.dataJSON['risk-access']['author'].x && this.dataJSON['risk-access']['author'].y) {
        // Author dots (red)
        context.beginPath();
        context.fillStyle = '#FD4664';
        context.arc(this.dataJSON['risk-access']['author'].x, this.dataJSON['risk-access']['author'].y, 7, 0, Math.PI * 2, true);
        context.fill();
        context.textAlign = 'center';
        context.font = 'bold 1.1rem Roboto, Times, serif';
        context.fillStyle = '#333';
        try {
          context.fillText('(A)',
                      this.dataJSON['risk-access']['author'].x,
                      this.dataJSON['risk-access']['author'].y + 20);
        } catch (ex) {}
      }

      if (this.dataJSON['risk-change']['author'].x && this.dataJSON['risk-change']['author'].y) {
        context.beginPath();
        context.fillStyle = '#FD4664';
        context.arc(this.dataJSON['risk-change']['author'].x,
                    this.dataJSON['risk-change']['author'].y, 7, 0, Math.PI * 2, true);
        context.fill();
        context.textAlign = 'center';
        context.font = 'bold 1.1rem Roboto, Times, serif';
        context.fillStyle = '#333';
        try {
          context.fillText('(M)',
                      this.dataJSON['risk-change']['author'].x,
                      this.dataJSON['risk-change']['author'].y + 20);
        } catch (ex) {}
      }

      if (this.dataJSON['risk-disappearance']['author'].x && this.dataJSON['risk-disappearance']['author'].y) {
        context.beginPath();
        context.fillStyle = '#FD4664';
        context.arc(this.dataJSON['risk-disappearance']['author'].x,
                    this.dataJSON['risk-disappearance']['author'].y, 7, 0, Math.PI * 2, true);
        context.fill();
        context.textAlign = 'center';
        context.font = 'bold 1.1rem Roboto, Times, serif';
        context.fillStyle = '#333';
        try {
          context.fillText('(D)',
                          this.dataJSON['risk-disappearance']['author'].x,
                          this.dataJSON['risk-disappearance']['author'].y + 20);
        } catch (ex) {}
      }

      // Evaluator dots (blue)
      if (this.dataJSON['risk-access']['evaluator'].x && this.dataJSON['risk-access']['evaluator'].y) {
        context.beginPath();
        context.fillStyle = '#091C6B';
        context.arc(this.dataJSON['risk-access']['evaluator'].x,
                    this.dataJSON['risk-access']['evaluator'].y, 7, 0, Math.PI * 2, true);
        context.fill();
      }

      if (this.dataJSON['risk-change']['evaluator'].x && this.dataJSON['risk-change']['evaluator'].y) {
        context.beginPath();
        context.fillStyle = '#091C6B';
        context.arc(this.dataJSON['risk-change']['evaluator'].x,
                    this.dataJSON['risk-change']['evaluator'].y, 7, 0, Math.PI * 2, true);
        context.fill();
      }

      if (this.dataJSON['risk-disappearance']['evaluator'].x && this.dataJSON['risk-disappearance']['evaluator'].y) {
        context.beginPath();
        context.fillStyle = '#091C6B';
        context.arc(this.dataJSON['risk-disappearance']['evaluator'].x,
                    this.dataJSON['risk-disappearance']['evaluator'].y, 7, 0, Math.PI * 2, true);
        context.fill();
      }

      // Gradient color definition for dotted lines
      const grad = context.createLinearGradient(50, 50, 150, 150);

      // Dotted lines params
      context.setLineDash([0.1, 1.8]);
      context.lineWidth = 0.3;

      // Dotted lines
      if (this.dataJSON['risk-access']['author'].x && this.dataJSON['risk-access']['author'].y &&
          this.dataJSON['risk-access']['evaluator'].x && this.dataJSON['risk-access']['evaluator'].y) {
        context.beginPath();
        const gradRisk1 = context.createLinearGradient(this.dataJSON['risk-access']['author'].x,
                                                      this.dataJSON['risk-access']['author'].y,
                                                      this.dataJSON['risk-access']['evaluator'].x,
                                                      this.dataJSON['risk-access']['evaluator'].y);
        gradRisk1.addColorStop(0, '#FD4664');
        gradRisk1.addColorStop(1, '#091C6B');
        context.strokeStyle = gradRisk1;
        context.moveTo(this.dataJSON['risk-access']['author'].x, this.dataJSON['risk-access']['author'].y);
        context.lineTo(this.dataJSON['risk-access']['evaluator'].x, this.dataJSON['risk-access']['evaluator'].y);
        context.closePath();
        context.stroke();
      }

      if (this.dataJSON['risk-change']['author'].x && this.dataJSON['risk-change']['author'].y &&
          this.dataJSON['risk-change']['evaluator'].x && this.dataJSON['risk-change']['evaluator'].y) {
        context.beginPath();
        const gradRisk2 = context.createLinearGradient(this.dataJSON['risk-change']['author'].x,
                                                      this.dataJSON['risk-change']['author'].y,
                                                      this.dataJSON['risk-change']['evaluator'].x,
                                                      this.dataJSON['risk-change']['evaluator'].y);
        gradRisk2.addColorStop(0, '#FD4664');
        gradRisk2.addColorStop(1, '#091C6B');
        context.strokeStyle = gradRisk2;
        context.moveTo(this.dataJSON['risk-change']['author'].x, this.dataJSON['risk-change']['author'].y);
        context.lineTo(this.dataJSON['risk-change']['evaluator'].x, this.dataJSON['risk-change']['evaluator'].y);
        context.closePath();
        context.stroke();
      }

      if (this.dataJSON['risk-disappearance']['author'].x && this.dataJSON['risk-disappearance']['author'].y &&
          this.dataJSON['risk-disappearance']['evaluator'].x && this.dataJSON['risk-disappearance']['evaluator'].y) {
        context.beginPath();
        const gradRisk3 = context.createLinearGradient(this.dataJSON['risk-disappearance']['author'].x,
                                                      this.dataJSON['risk-disappearance']['author'].y,
                                                      this.dataJSON['risk-disappearance']['evaluator'].x,
                                                      this.dataJSON['risk-disappearance']['evaluator'].y);
        gradRisk3.addColorStop(0, '#FD4664');
        gradRisk3.addColorStop(1, '#091C6B');
        context.strokeStyle = gradRisk3;
        context.moveTo(this.dataJSON['risk-disappearance']['author'].x, this.dataJSON['risk-disappearance']['author'].y);
        context.lineTo(this.dataJSON['risk-disappearance']['evaluator'].x, this.dataJSON['risk-disappearance']['evaluator'].y);
        context.closePath();
        context.stroke();
      }
  }

}
