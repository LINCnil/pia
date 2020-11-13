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
  viewStyle: { view: string } = { view: 'card'};
  view: 'card';
  paramsSubscribe: Subscription;
  searchText: string;

  public type_entries: string; // pia / archive / knowledgeBase / structure
  public entries: Array<any> = [];

  public showModal = false;

  constructor(
    private router: Router,
    private el: ElementRef,
    public archiveService: ArchiveService,
    public structureService: StructureService,
    private knowledgeBaseService: KnowledgeBaseService,
    public piaService: PiaService,
    private introJsService: IntrojsService,
    public appDataService: AppDataService) {

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
    const pia = new Pia();
    setTimeout(async () => {

      switch (this.type_entries) {
        case 'pia':
          this.piaService.getAllActives().then((entries: Array<Pia>) => {
            this.entries = entries;
            this.entries.forEach(entrie => this.piaService.calculPiaProgress(entrie));
            this.startIntroJs('pia');
          });
          break;
        case 'archive':
          this.piaService.findAllArchives().then((entries: Array<Pia>) => {
            this.entries = entries;
            this.entries.forEach(entrie => this.archiveService.calculPiaProgress(entrie));
          });
          break;
        case 'structure':
          let data;
          this.structureService.getAll()
            .then((response) => {
              data = response;
              this.structureService
                .loadExample()
                .then((structureExample: Structure) => {
                  data.push(structureExample);
                });
              this.entries = data;
            });
          break;
        case 'knowledgeBase':
          this.knowledgeBaseService.getAll()
          .then((result: any) => {
            this.entries = result;
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
  onFormSubmited(id): void {
    this.refreshContent();
    this.showModal = false;
    // TODO: entry module
    // this.router.navigate(['entry', id, 'section', 1, 'item', 1]);
  }

  /**
   * Import a new PIA.
   * @param [event] - Any Event.
   */
  import(event?: any): void {
    if (event) {
      if (this.type_entries === 'pia') {
        this.piaService.import(event.target.files[0])
        .then(() => {
          this.refreshContent();
        })
        .catch((err) => {
          console.log(err);
        });
      }
      if (this.type_entries === 'structure') {
        this.structureService.importStructure(event.target.files[0])
          .then(() => {
            this.refreshContent();
          })
          .catch((err) => {
            console.log(err);
          });
      }
      if (this.type_entries === 'knowledgeBase') {
        this.knowledgeBaseService.import(event.target.files[0])
          .then(() => {
            this.refreshContent();
          })
          .catch((err) => {
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
        const validated = this.entries.filter((e: Pia) => e.status === 2 || e.status === 3);
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
