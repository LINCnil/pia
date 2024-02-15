import { Component, DoCheck, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Answer } from 'src/app/models/answer.model';
import { Pia } from 'src/app/models/pia.model';
import { ActionPlanService } from 'src/app/services/action-plan.service';
import { AnswerService } from 'src/app/services/answer.service';
import { ApiService } from 'src/app/services/api.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { IntrojsService } from 'src/app/services/introjs.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { MeasureService } from 'src/app/services/measures.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { PiaService } from 'src/app/services/pia.service';
import { RevisionService } from 'src/app/services/revision.service';
import { SidStatusService } from 'src/app/services/sid-status.service';

@Component({
  selector: 'app-pia',
  templateUrl: './pia.component.html',
  styleUrls: ['./pia.component.scss']
})
export class PiaComponent implements OnInit, DoCheck {
  section: { id: number; title: string; short_help: string; items: any };
  item: {
    id: number;
    title: string;
    evaluation_mode: string;
    short_help: string;
    questions: any;
  };
  data: { sections: any };
  questions: any;
  measureToRemoveFromTags: string;
  subscription: Subscription;
  measures: any;

  public sideView = 'knowledge';
  public revisions = null;
  public revisionOverlay = false;
  public pia = null;
  public download = false;
  public preview;

  public editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';

  constructor(
    private route: ActivatedRoute,
    private appDataService: AppDataService,
    private sidStatusService: SidStatusService,
    private knowledgeBaseService: KnowledgeBaseService,
    public piaService: PiaService,
    private actionPlanService: ActionPlanService,
    private globalEvaluationService: GlobalEvaluationService,
    public revisionService: RevisionService,
    private measureService: MeasureService,
    private router: Router,
    private answerService: AnswerService,
    private introjsService: IntrojsService,
    private paginationService: PaginationService,
    private dialogService: DialogService,
    public authService: AuthService,
    public apiService: ApiService
  ) {
    this.introjsService.entrySideViewChange.subscribe(value => {
      this.sideView = value;
    });
  }

  async ngOnInit(): Promise<void> {
    this.appDataService.entrieMode = 'pia';
    const sectionId = parseInt(this.route.snapshot.params.section_id, 10);
    const itemId = parseInt(this.route.snapshot.params.item_id, 10);

    this.authService.currentUser.subscribe({
      complete: () => {
        if (this.route.snapshot.params.id == 'example') {
          this.piaService
            .getPiaExample()
            .then((pia: Pia) => {
              this.pia = pia;
              this.setupPage(sectionId, itemId);
              this.router.navigate(['pia', pia.id, 'section', 1, 'item', 1]);
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          this.piaService
            .find(parseInt(this.route.snapshot.params.id))
            .then((pia: Pia) => {
              this.pia = pia;
              this.setupPage(sectionId, itemId);
            })
            .catch(err => {
              console.error(err);
            });
        }
      }
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface typedef
  async ngOnDestroy() {
    // TODO: WAIT PROGRESSION SAVED BEFORE CHANGE PAGE
    await this.piaService.calculPiaProgress(this.pia, true);
  }

  ngDoCheck(): void {
    if (
      this.measureToRemoveFromTags &&
      this.measureToRemoveFromTags.length > 0
    ) {
      const measureName = this.measureToRemoveFromTags;
      this.measureToRemoveFromTags = null;

      // Update tags when removing measures from 3.1
      const itemsQuestions = [];
      this.appDataService.dataNav.sections.forEach(section => {
        section.items.forEach(item => {
          if (item.questions) {
            itemsQuestions.push(
              item.questions.filter(question => {
                return (
                  question.answer_type === 'list' &&
                  question.is_measure === true
                );
              })
            );
          }
        });
      });

      // Keep only questions with measures lists
      const listQuestions = itemsQuestions.filter(
        v => Object.keys(v).length !== 0
      );

      // For each of these questions, get their respective answer
      listQuestions.forEach(questionsSet => {
        questionsSet.forEach(q => {
          this.answerService
            .getByReferenceAndPia(parseInt(this.route.snapshot.params.id), q.id)
            .then((answer: Answer) => {
              if (
                answer &&
                answer.data &&
                answer.data.list.length > 0 &&
                answer.data.list.includes(measureName)
              ) {
                const index = answer.data.list.indexOf(measureName);
                answer.data.list.splice(index, 1);
                this.answerService.update(answer);
              }
            });
        });
      });
    }
  }

  // tslint:disable-next-line:typedef
  async setupPage(sectionId, itemId) {
    if (!sectionId || !itemId) {
      this.router.navigate(['pia', this.pia.id, 'section', 1, 'item', 1]);
    } else {
      if (this.pia.structure_data) {
        this.appDataService.dataNav = this.pia.structure_data;
      } else {
        this.appDataService.resetDataNav();
      }
      this.data = this.appDataService.dataNav;
    }
    this.globalEvaluationService.pia = this.pia;
    this.route.params.subscribe((params: Params) => {
      this.getSectionAndItem(
        parseInt(params.section_id, 10),
        parseInt(params.item_id, 10)
      );
      window.scroll(0, 0);
    });
    // Subscribe to measure service messages
    this.subscription = this.measureService.behaviorSubject.subscribe(val => {
      this.measureToRemoveFromTags = val;
    });
    // Start onboarding
    if (!localStorage.getItem('onboardingEntryConfirmed')) {
      this.introjsService.start('entry');
    } else if (localStorage.getItem('onboardingEntryConfirmed')) {
      this.introjsService.start('evaluation');
    }
    // Subscribe to Auth type for enable / disable rights on fields
    this.authService.currentUser.subscribe({
      complete: () => {
        if (this.authService.state) {
          this.editMode = [];
          if (
            this.authService.currentUserValue.access_type.includes('functional')
          ) {
            this.editMode = ['author', 'validator', 'evaluator', 'guest'];
          } else if (this.pia.is_example) {
            this.editMode = ['guest'];
          } else {
            this.pia.user_pias.forEach(up => {
              if (
                parseInt(up.user.id) ===
                  this.authService.currentUserValue.resource_owner_id &&
                Array.isArray(this.editMode)
              ) {
                this.editMode.push(up.role);
              }
            });
          }
        } else {
          this.editMode = 'local';
        }
      }
    });
  }

  /**
   * Get the current Section and Item and initialize others information.
   * @param sectionId - The section id.
   * @param itemId - The item id.
   */
  private async getSectionAndItem(sectionId: number, itemId: number) {
    if (this.pia.structure_data) {
      this.appDataService.dataNav = this.pia.structure_data;
    }

    this.data = this.appDataService.dataNav;

    this.section = this.data.sections.filter(section => {
      return section.id === sectionId;
    })[0];

    if (this.section) {
      this.item = this.section.items.filter(item => {
        return item.id === itemId;
      })[0];
    }

    // reset status on section change, this will be calculed again
    this.globalEvaluationService.status = null;
    this.globalEvaluationService.section = this.section;
    this.globalEvaluationService.item = this.item;

    this.questions = [];

    if (this.item.questions) {
      this.item.questions.forEach(question => {
        this.questions.push(question);
      });
    }

    await this.globalEvaluationService.validate();

    this.measureService.findAllByPia(this.pia.id).then(measures => {
      this.measures = measures;
      /* Modal for risks if no measures yet */
      let displayModal = true;
      if (
        this.section.id === 3 &&
        (this.item.id === 2 || this.item.id === 3 || this.item.id === 4)
      ) {
        if (measures.length > 0) {
          measures.forEach(element => {
            if (element.title && element.title.length > 0) {
              displayModal = false;
            }
          });
        }

        if (displayModal) {
          this.dialogService.confirmThis(
            {
              text: 'modals.declare_measures.content',
              type: 'yes',
              yes: 'modals.declare_measures.declare',
              no: '',
              icon: 'fa fa-arrow-left icon-blue',
              data: {
                no_cross_button: true
              }
            },
            () => {
              this.router.navigate([
                '/pia',
                this.pia.id,
                'section',
                3,
                'item',
                1
              ]);
            },
            () => {
              return false;
            }
          );
        }
      }

      /* Modal for action plan if no evaluations yet */
      if (
        this.section.id === 4 &&
        this.item.id === 2 &&
        !this.sidStatusService.verifEnableActionPlan()
      ) {
        this.dialogService.confirmThis(
          {
            text: 'modals.action_plan_no_evaluation.content',
            type: 'yes',
            yes: 'modals.action_plan_no_evaluation.review_section',
            no: '',
            icon: 'fa fa-cog icon-blue',
            data: {
              btn_yes: 'btn-blue',
              no_cross_button: true
            }
          },
          () => {
            const gotoSectionItem = this.paginationService.getNextSectionItem(
              4,
              5
            );
            this.router.navigate([
              '/pia',
              this.pia.id,
              'section',
              gotoSectionItem[0],
              'item',
              gotoSectionItem[1]
            ]);
          },
          () => {
            return false;
          }
        );
      }

      /* Modal for dpo page if all evaluations are not done yet */
      if (
        this.section.id === 4 &&
        this.item.id === 3 &&
        !this.sidStatusService.enableDpoValidation
      ) {
        this.dialogService.confirmThis(
          {
            text: 'modals.dpo_missing_evaluations.content',
            type: 'yes',
            yes: 'modals.action_plan_no_evaluation.review_section',
            no: '',
            icon: 'fa fa-cog icon-blue',
            data: {
              btn_yes: 'btn-blue',
              no_cross_button: true
            }
          },
          () => {
            const gotoSectionItem = this.paginationService.getNextSectionItem(
              0,
              7
            );
            this.router.navigate([
              '/pia',
              this.pia.id,
              'section',
              gotoSectionItem[0],
              'item',
              gotoSectionItem[1]
            ]);
          },
          () => {
            return false;
          }
        );
      }
    });

    this.actionPlanService.data = this.data;
    this.actionPlanService.pia = this.pia;
    this.actionPlanService.listActionPlan();

    // Update on knowledge base (scroll / content / search field)
    const knowledgeBaseScroll = document.querySelector(
      '.pia-knowledgeBaseBlock-list'
    );
    const knowledgeBaseContent = document.querySelector(
      '.pia-knowledgeBaseBlock-searchForm input'
    ) as HTMLInputElement;
    if (knowledgeBaseContent) {
      knowledgeBaseScroll.scrollTop = 0;
      knowledgeBaseContent.value = '';
    }

    this.knowledgeBaseService.q = null;
    this.knowledgeBaseService.loadByItem(this.item);
    this.knowledgeBaseService.placeholder = null;
  }

  newMeasureAdded($event): void {
    this.measures.push($event);
    this.globalEvaluationService.validate();
  }
}
