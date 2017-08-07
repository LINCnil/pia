import { Component, OnInit, Input } from '@angular/core';
import { Measure } from 'app/entry/entry-content/measures/measure.model';
import { Evaluation } from 'app/entry/entry-content/evaluations/evaluation.model';

@Component({
  selector: 'app-action-plan-graph',
  templateUrl: './action-plan-graph.component.html',
  styleUrls: ['./action-plan-graph.component.scss']
})
export class ActionPlanGraphComponent implements OnInit {
  @Input() data: any;
  @Input() pia: any;
  results = [];
  measures = [];
  risks = [];

  constructor() { }

  ngOnInit() {
    const section = this.data.sections.filter((s) => {
      return s.id === 2;
    });
    section[0].items.forEach((item) => {
      item.questions.forEach(q => {
        const evaluation = new Evaluation();
        const reference_to = '2.' + item.id + '.' + q.id;
        this.results[reference_to] = null;
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 0) {
            this.results[reference_to] = evaluation.status;
          }
        });
      });
    });

    const measure = new Measure();
    measure.pia_id = this.pia.id;
    measure.findAll().then((entries: any) => {
      entries.forEach(m => {
        const evaluation = new Evaluation();
        const reference_to = '3.1.' + m.id;
        this.measures[reference_to] = null;
        evaluation.getByReference(this.pia.id, reference_to).then(() => {
          if (evaluation.status > 0) {
            this.measures.push({ name: m.title, status: evaluation.status });
          }
        });
      });
    });

    const evaluation = new Evaluation();
    evaluation.getByReference(this.pia.id, '3.2').then(() => {
      if (evaluation.status > 0) {
        this.risks['3.2'] = evaluation.status;
      }
    });

    const evaluation2 = new Evaluation();
    evaluation2.getByReference(this.pia.id, '3.3').then(() => {
      if (evaluation2.status > 0) {
        this.risks['3.3'] = evaluation2.status;
      }
    });

    const evaluation3 = new Evaluation();
    evaluation3.getByReference(this.pia.id, '3.4').then(() => {
      if (evaluation3.status > 0) {
        this.risks['3.4'] = evaluation3.status;
      }
    });
  }

}
