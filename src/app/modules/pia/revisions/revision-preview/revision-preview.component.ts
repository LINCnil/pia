import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppDataService } from 'src/app/services/app-data.service';
import { TranslateService } from '@ngx-translate/core';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { RevisionService } from 'src/app/services/revision.service';
import { Answer } from 'src/app/models/answer.model';
import { Evaluation } from 'src/app/models/evaluation.model';
import { Pia } from 'src/app/models/pia.model';
import { Revision } from 'src/app/models/revision.model';
import { PiaService } from 'src/app/services/pia.service';
import { DialogService } from 'src/app/services/dialog.service';
import { Router } from '@angular/router';
import { EvaluationService } from 'src/app/services/evaluation.service';
import { AuthService } from 'src/app/services/auth.service';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

@Component({
  selector: 'app-revision-preview',
  templateUrl: './revision-preview.component.html',
  styleUrls: ['./revision-preview.component.scss'],
  providers: [
    AppDataService,
    SidStatusService,
    RevisionService,
    TranslateService,
    DatePipe
  ]
})
export class RevisionPreviewComponent implements OnInit {
  @Input() revision: Revision;
  @Input() date: Date;
  @Output() restored = new EventEmitter();
  @Input() editMode: 'local' | 'author' | 'evaluator' | 'validator' | 'guest' =
    'local';
  export: any;
  pia: Pia;
  allData: any;
  data: any;

  constructor(
    public authService: AuthService,
    private translateService: TranslateService,
    public appDataService: AppDataService,
    public sidStatusService: SidStatusService,
    public revisionService: RevisionService,
    public piaService: PiaService,
    private datePipe: DatePipe,
    private router: Router,
    private dialogService: DialogService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.export = JSON.parse(this.revision.export);

    if (this.export.pia.structure_data) {
      this.appDataService.dataNav = this.export.pia.structure_data;
    } else {
      this.appDataService.resetDataNav();
    }

    this.data = this.appDataService.dataNav;
    this.getJsonInfo();
  }

  private async getJsonInfo(): Promise<any> {
    this.allData = {};
    this.data.sections.forEach(async section => {
      this.allData[section.id] = {};
      section.items.forEach(async item => {
        this.allData[section.id][item.id] = {};
        const ref = section.id.toString() + '.' + item.id.toString();

        // Measure
        if (item.is_measure) {
          this.allData[section.id][item.id] = [];

          const entries: any = this.export.measures;
          entries.forEach(async measure => {
            /* Completed measures */
            if (measure.title !== undefined && measure.content !== undefined) {
              let evaluation = null;
              if (item.evaluation_mode === 'question') {
                evaluation = await this.getEvaluation(
                  section.id,
                  item.id,
                  ref + '.' + measure.id
                );
              }
              this.allData[section.id][item.id].push({
                title: measure.title,
                content: measure.content,
                evaluation
              });
            }
          });
        } else if (item.questions) {
          // Question
          item.questions.forEach(async question => {
            this.allData[section.id][item.id][question.id] = {};

            // Find answer
            const answerModel = new Answer();
            const answer = this.export.answers.find(
              a => a.reference_to === question.id
            );
            if (answer) {
              answerModel.data = this.export.answers.find(
                a => a.reference_to === question.id
              ).data;

              /* An answer exists */
              if (answerModel.data) {
                const content = [];
                if (answerModel.data.gauge && answerModel.data.gauge > 0) {
                  content.push(
                    this.translateService.instant(
                      this.piaService.getGaugeName(answerModel.data.gauge)
                    )
                  );
                }
                if (answerModel.data.text && answerModel.data.text.length > 0) {
                  content.push(answerModel.data.text);
                }
                if (answerModel.data.list && answerModel.data.list.length > 0) {
                  content.push(answerModel.data.list.join(', '));
                }
                if (content.length > 0) {
                  if (item.evaluation_mode === 'question') {
                    const evaluation = await this.getEvaluation(
                      section.id,
                      item.id,
                      ref + '.' + question.id
                    );
                    this.allData[section.id][item.id][
                      question.id
                    ].evaluation = evaluation;
                  }
                  this.allData[section.id][item.id][
                    question.id
                  ].content = content.join(', ');
                }
              }
            }
          });
        }
        if (item.evaluation_mode === 'item') {
          const evaluation = await this.getEvaluation(section.id, item.id, ref);
          this.allData[section.id][item.id]['evaluation_item'] = evaluation;
        }
      });
    });
  }

  private async getEvaluation(
    section_id: string,
    item_id: string,
    ref: string
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let evaluation = null;
      const evaluationModel = new Evaluation();
      // const exist = await evaluationModel.getByReference(this.export.pia.id, ref);
      const exist = this.export.evaluations.find(e => e.reference_to === ref);
      if (exist) {
        evaluationModel.id = exist.id;
        evaluationModel.status = exist.status;
        evaluationModel.pia_id = this.export.pia.id;
        evaluationModel.reference_to = exist.reference_to;
        evaluationModel.action_plan_comment = exist.action_plan_comment;
        evaluationModel.evaluation_comment = exist.evaluation_comment;
        evaluationModel.evaluation_date = exist.evaluation_date;
        evaluationModel.gauges = exist.gauges;
        evaluationModel.estimated_implementation_date = new Date(
          exist.estimated_implementation_date
        );
        evaluationModel.person_in_charge = exist.person_in_charge;
        evaluationModel.global_status = exist.global_status;

        evaluation = {
          title: this.evaluationService.getStatusName(evaluationModel.status),
          action_plan_comment: evaluationModel.action_plan_comment,
          evaluation_comment: evaluationModel.evaluation_comment,
          gauges: {
            riskName: {
              value: this.translateService.instant(
                'sections.' + section_id + '.items.' + item_id + '.title'
              )
            },
            seriousness: evaluationModel.gauges
              ? evaluationModel.gauges.x
              : null,
            likelihood: evaluationModel.gauges ? evaluationModel.gauges.y : null
          }
        };
      }
      resolve(evaluation);
    });
  }

  public exportJson(): void {
    const revisionDate = this.datePipe.transform(
      this.revision.created_at,
      '-yyyy-MM-dd-HH-mm'
    );
    const fileTitle = 'pia-' + slugify(this.export.pia.name) + revisionDate;
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    if (navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(
        'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(this.revision)),
        fileTitle + '.json'
      );
    } else {
      downloadLink.href =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(this.revision));
      downloadLink.download = fileTitle + '.json';
      downloadLink.click();
    }
    localStorage.removeItem('currentRevisionDate');
  }

  public restoreRevision(): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.recover_version.message',
        type: 'confirm',
        yes: 'modals.recover_version.continue',
        no: 'modals.cancel',
        data: {
          date: new Date(this.revision.created_at)
        }
      },
      () => {
        this.revisionService
          .loadRevision(this.revision.id)
          .then((piaExport: any) => {
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate([
                  'pia',
                  piaExport.pia.id,
                  'section',
                  1,
                  'item',
                  1
                ]);
              });
          });
      },
      () => {
        return false;
      }
    );
  }

  public printRevision(elementId): void {
    const printElement = document.getElementById(elementId);
    const printWindow = window.open('', 'PRINT');
    printWindow.document.write(document.documentElement.innerHTML);
    setTimeout(() => {
      // Needed for large documents
      printWindow.document.body.style.margin = '0 0';
      printWindow.document.body.innerHTML = printElement.innerHTML;
      printWindow.document.close(); // necessary for IE >= 10
      printWindow.focus(); // necessary for IE >= 10*/
      printWindow.print();
      printWindow.close();
    }, 1000);
  }
}
