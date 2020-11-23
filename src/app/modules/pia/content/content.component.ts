import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Pia } from 'src/app/models/pia.model';
import { AppDataService } from 'src/app/services/app-data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { PiaService } from 'src/app/services/pia.service';
import { SidStatusService } from 'src/app/services/sid-status.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  @Input() pia: Pia = null;
  @Input() section: any;
  @Input() item: any;
  @Input() questions: any;
  @Input() measures: any;
  @Input() data: any;

  userAnswersForImpacts = [];
  userAnswersForThreats = [];
  userAnswersForSources = [];

  constructor(
    private router: Router,
    private appDataService: AppDataService,
    private activatedRoute: ActivatedRoute,
    public measureService: MeasureService,
    public piaService: PiaService,
    public sidStatusService: SidStatusService,
    public globalEvaluationService: GlobalEvaluationService,
    public paginationService: PaginationService,
    private knowledgeBaseService: KnowledgeBaseService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // Reset measures no longer addable from KB when switching PIA
    this.knowledgeBaseService.toHide = [];

    // Update the last edited date for this PIA
    this.pia.updated_at = new Date();
    this.piaService.update(this.pia);

    if (this.pia.is_archive === 1) {
      this.router.navigate(['/entries']);
    }
  }

  ngOnChanges(): void {
    this.paginationService.dataNav = this.appDataService.dataNav;

    const sectionId = parseInt(
      this.activatedRoute.snapshot.params.section_id,
      10
    );
    const itemId = parseInt(this.activatedRoute.snapshot.params.item_id, 10);

    if (sectionId && itemId) {
      this.paginationService.setPagination(sectionId, itemId);
    }
  }

  /**
   * Prepare entry for evaluation.
   */
  prepareForEvaluation(): void {
    this.globalEvaluationService.prepareForEvaluation().then(() => {
      let isPiaFullyEdited = true;
      for (const el in this.sidStatusService.itemStatus) {
        if (
          this.sidStatusService.itemStatus.hasOwnProperty(el) &&
          this.sidStatusService.itemStatus[el] < 4 &&
          el !== '4.3'
        ) {
          isPiaFullyEdited = false;
        }
      }
      if (isPiaFullyEdited) {
        this.goToNextSectionItem(4, 5);
        this.dialogService.confirmThis(
          {
            text: 'modals.completed_edition.content',
            type: 'yes',
            yes: 'modals.continue',
            no: '',
            icon: 'fa fa-cog icon-gray'
          },
          () => {
            return;
          },
          () => {
            return;
          }
        );
      } else {
        this.goToNextSectionItem(0, 4);
        this.dialogService.confirmThis(
          {
            text: 'modals.ask_for_evaluation.content',
            type: 'yes',
            yes: 'modals.continue',
            no: '',
            icon: 'fa fa-pencil-square-o icon-green'
          },
          () => {
            return;
          },
          () => {
            return;
          }
        );
      }
    });
  }

  /**
   * Allow an user to validate evaluation for a section.
   */
  validateEvaluation(): void {
    this.globalEvaluationService
      .validateAllEvaluation()
      .then((toFix: boolean) => {
        this.goToNextSectionItem(5, 7);
        let isPiaFullyEvaluated = true;
        for (const el in this.sidStatusService.itemStatus) {
          if (
            this.sidStatusService.itemStatus.hasOwnProperty(el) &&
            this.sidStatusService.itemStatus[el] !== 7 &&
            el !== '4.3'
          ) {
            isPiaFullyEvaluated = false;
          }
        }
        if (isPiaFullyEvaluated) {
          this.dialogService.confirmThis(
            {
              text: 'modals.completed_evaluation.content',
              type: 'yes',
              yes: 'modals.continue',
              no: '',
              icon: 'fa fa-check icon-gray'
            },
            () => {
              return;
            },
            () => {
              return;
            }
          );
        } else if (toFix) {
          this.dialogService.confirmThis(
            {
              text: 'modals.validate_evaluation_to_correct.content',
              type: 'yes',
              yes: 'modals.continue',
              no: '',
              icon: 'fa fa-pencil-square-o icon-gray'
            },
            () => {
              return;
            },
            () => {
              return;
            }
          );
        } else {
          this.dialogService.confirmThis(
            {
              text: 'modals.validate_evaluation.content',
              type: 'yes',
              yes: 'modals.continue',
              no: '',
              icon: 'fa fa-cog icon-green'
            },
            () => {
              return;
            },
            () => {
              return;
            }
          );
        }
      });
  }

  /**
   * Go to next item.
   * @private
   * @param status_start - From status.
   * @param status_end - To status.
   */
  private goToNextSectionItem(status_start: number, status_end: number): void {
    const goto_section_item = this.paginationService.getNextSectionItem(
      status_start,
      status_end
    );

    this.router.navigate([
      'pia',
      this.pia.id,
      'section',
      goto_section_item[0],
      'item',
      goto_section_item[1]
    ]);
  }

  /**
   * Allow an user to return in edit mode.
   */
  cancelAskForEvaluation(): void {
    this.globalEvaluationService.cancelForEvaluation();
    this.dialogService.confirmThis(
      {
        text: 'modals.back_to_edition.content',
        type: 'yes',
        yes: 'modals.continue',
        no: '',
        icon: 'fa fa-pencil-square-o icon-gray'
      },
      () => {
        return;
      },
      () => {
        return;
      }
    );
  }

  /**
   * Allow an user to cancel the validation.
   */
  cancelValidateEvaluation(): void {
    this.globalEvaluationService.cancelValidation();
    this.dialogService.confirmThis(
      {
        text: 'modals.back_to_evaluation.content',
        type: 'yes',
        yes: 'modals.continue',
        no: '',
        icon: 'fa fa-cog icon-gray'
      },
      () => {
        return;
      },
      () => {
        return;
      }
    );
  }

  onAddNewMeasure(): void {
    this.measureService.addNewMeasure(this.pia).then(measure => {
      this.measures.unshift(measure);
      this.globalEvaluationService.validate();
    });
  }
}
