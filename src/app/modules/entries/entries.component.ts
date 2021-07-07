import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Pia } from 'src/app/models/pia.model';
import { ArchiveService } from 'src/app/services/archive.service';
import { PiaService } from 'src/app/services/pia.service';
import { Structure } from 'src/app/models/structure.model';
import { StructureService } from 'src/app/services/structure.service';
import { AppDataService } from 'src/app/services/app-data.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { IntrojsService } from 'src/app/services/introjs.service';
import { DialogService } from 'src/app/services/dialog.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit, OnDestroy {
  @Input() pia: any;
  importForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string } = { view: 'card' };
  view: 'card';
  paramsSubscribe: Subscription;
  searchText: string;

  public type_entries: string; // pia / archive / knowledgeBase / structure
  public entries: Array<any> = [];
  public showModal = false;

  public loading = false;

  constructor(
    private router: Router,
    private el: ElementRef,
    public archiveService: ArchiveService,
    public structureService: StructureService,
    private knowledgeBaseService: KnowledgeBaseService,
    public piaService: PiaService,
    private introJsService: IntrojsService,
    public appDataService: AppDataService,
    private translateService: TranslateService,
    public dialogService: DialogService
  ) {
    // get entries type (pia or archive)
    switch (this.router.url) {
      case '/entries/archive':
        this.type_entries = 'archive';
        break;
      case '/entries/structure':
        this.type_entries = 'structure';
        break;
      case '/entries/knowledgebase':
        this.type_entries = 'knowledgeBase';
        break;
      case '/entries':
        this.type_entries = 'pia';
        break;
      default:
        break;
    }

    this.appDataService.entrieMode = this.type_entries;
  }

  ngOnInit(): void {
    // PREPARE ORDER
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }

    // PREPARE VIEW MODE
    if (localStorage.getItem('homepageDisplayMode') === 'list') {
      this.viewOnList();
    } else {
      this.viewOnCard();
    }

    // INIT IMPORT FORM
    this.importForm = new FormGroup({
      import_file: new FormControl('', [])
    });
  }

  ngOnDestroy(): void {
    // TODO: Mode params
    // this.paramsSubscribe.unsubscribe();
  }

  onCleanSearch(): void {
    this.searchText = '';
  }

  /**
   * Asort items created on PIA.
   * @param fieldToSort - Field to sort.
   */
  sortBy(fieldToSort: string): void {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sort();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   */
  viewOnList(): void {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // TODO: Mode params
    // this.router.navigate(['entries', 'list']);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  viewOnCard(): void {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // TODO: Mode params
    // this.router.navigate(['entries', 'card']);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   */
  async refreshContent(): Promise<void> {
    this.loading = true;
    this.entries = [];
    setTimeout(async () => {
      switch (this.type_entries) {
        case 'pia':
          await this.piaService.getAllActives().then((entries: Array<Pia>) => {
            this.entries = entries;

            // Remove example from list
            const index = this.entries.findIndex(p => p.is_example);
            if (index !== -1) {
              this.entries.splice(index, 1);
            }

            this.entries.forEach(entrie => {
              this.piaService.pia_id = entrie.id;
              this.piaService.calculPiaProgress(entrie);
            });
            this.loading = false;
            this.startIntroJs('pia');
          });
          break;
        case 'archive':
          await this.piaService
            .findAllArchives()
            .then((entries: Array<Pia>) => {
              this.entries = entries;
              this.entries.forEach(entrie =>
                this.archiveService.calculPiaProgress(entrie)
              );
              this.loading = false;
            });
          break;
        case 'structure':
          let data;
          await this.structureService.getAll().then(response => {
            data = response;
            this.structureService
              .loadExample()
              .then((structureExample: Structure) => {
                data.push(structureExample);
              });
            this.entries = data;
            this.loading = false;
          });
          break;
        case 'knowledgeBase':
          await this.knowledgeBaseService.getAll().then((result: any) => {
            // Parse default Knowledge base json
            let defaultKnowledgeBase = new KnowledgeBase(
              0,
              this.translateService.instant(
                'knowledge_base.default_knowledge_base'
              ),
              'CNIL',
              'CNIL'
            );
            defaultKnowledgeBase.is_example = true;
            result.push(defaultKnowledgeBase);
            this.entries = result;
            this.loading = false;
          });
          break;
        default:
          break;
      }

      this.sortOrder = localStorage.getItem('sortOrder');
      this.sortValue = localStorage.getItem('sortValue');
      this.sort();
    }, 200);
  }

  updateEntrie(entrie): void {
    if (this.entries.includes(entrie)) {
      this.entries.forEach(item => {
        if (item.id === entrie.id) {
          item = entrie;
        }
      });
    }
  }

  open(): void {
    const cardsToSwitch = document.getElementById('cardsSwitch');
    cardsToSwitch.classList.toggle('flipped');
    const rocketToHide = document.getElementById('pia-rocket');
    if (rocketToHide) {
      rocketToHide.style.display = 'none';
    }
  }

  /**
   * Inverse the order of the list.
   */
  reverse(): void {
    const cardsToSwitchReverse = document.getElementById('cardsSwitch');
    cardsToSwitchReverse.classList.remove('flipped');
  }

  /**
   * Go to the new entry route
   * @param id id
   */
  onFormSubmited(id, type: string = null): void {
    this.refreshContent();
    this.showModal = false;
    // go to the edit page
    if (type) {
      switch (type) {
        case 'pia':
          this.router.navigate(['pia', id, 'section', 1, 'item', 1]);
          break;
        case 'structure':
          this.router.navigate(['structures', id, 'section', 1, 'item', 1]);
          break;
        case 'knowledgeBase':
          this.router.navigate(['base', id]);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Import a new PIA.
   * @param [event] - Any Event.
   */
  import(event?: any): void {
    if (event) {
      if (this.type_entries === 'pia') {
        this.piaService
          .import(event.target.files[0])
          .then(() => {
            this.refreshContent();
          })
          .catch(err => {
            this.dialogService.confirmThis(
              {
                text: 'modals.import_wrong_pia_file.content',
                type: 'yes',
                yes: 'modals.close',
                no: '',
                icon: 'pia-icons pia-icon-sad'
              },
              () => {
                return;
              },
              () => {
                return;
              }
            );
          });
      }
      if (this.type_entries === 'structure') {
        this.structureService
          .importStructure(event.target.files[0])
          .then(() => {
            this.refreshContent();
          })
          .catch(err => {
            this.dialogService.confirmThis(
              {
                text: 'modals.import_wrong_structure_file.content',
                type: 'yes',
                yes: 'modals.close',
                no: '',
                icon: 'pia-icons pia-icon-sad'
              },
              () => {
                return;
              },
              () => {
                return;
              }
            );
          });
      }
      if (this.type_entries === 'knowledgeBase') {
        this.knowledgeBaseService
          .import(event.target.files[0])
          .then(() => {
            this.refreshContent();
          })
          .catch(err => {
            console.log(err);
          });
      }
    } else {
      this.el.nativeElement.querySelector('#import_file').click();
    }
  }

  /**
   * Define how to sort the list.
   */
  private sort(): void {
    this.entries.sort((a, b) => {
      let firstValue = a[this.sortValue];
      let secondValue = b[this.sortValue];
      if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
        firstValue = new Date(a[this.sortValue]);
        secondValue = new Date(b[this.sortValue]);
      }
      if (
        this.sortValue === 'name' ||
        this.sortValue === 'author_name' ||
        this.sortValue === 'evaluator_name' ||
        this.sortValue === 'validator_name'
      ) {
        return firstValue.localeCompare(secondValue);
      } else {
        if (firstValue < secondValue) {
          return -1;
        }
        if (firstValue > secondValue) {
          return 1;
        }
        return 0;
      }
    });
    if (this.sortOrder === 'up') {
      this.entries.reverse();
    }
  }

  startIntroJs(type): void {
    switch (type) {
      case 'pia':
        const validated = this.entries.filter(
          (e: Pia) => (e.status === 2 || e.status === 3) && !e.is_example
        );
        if (validated.length > 0) {
          // Validated introjs
          if (!localStorage.getItem('onboardingValidatedConfirmed')) {
            this.introJsService.start('validated');
          }
        } else {
          // dashboard introjs
          const inProgress = this.entries.filter((e: Pia) => e.status === 1);
          if (inProgress && inProgress.length === 0) {
            if (!localStorage.getItem('onboardingDashboardConfirmed')) {
              if (localStorage.getItem('homepageDisplayMode') === 'card') {
                this.introJsService.start('dashboard');
              }
            }
          }
        }
        break;
      default:
        break;
    }
  }
}
