import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
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
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit, OnDestroy {
  @Input() pia: any;
  importForm: UntypedFormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string } = { view: 'card' };
  view: 'card';
  paramsSubscribe: Subscription;
  searchText: string;

  // FOR USER EDITION
  showNewUserForm: boolean;
  userBehavior: BehaviorSubject<User> = null;

  public users: Array<User> = [];

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
    public dialogService: DialogService,
    private userService: UsersService,
    private authService: AuthService
  ) {
    // get entries type (pia or archive)
    switch (this.router.url) {
      case '/entries/archive':
        this.type_entries = 'archive';
        break;
      case '/entries/structure':
        this.type_entries = 'structure';
        break;
      case '/entries/knowledge_bases':
        this.type_entries = 'knowledgeBase';
        break;
      case '/entries':
        this.type_entries = 'pia';
        break;
      default:
        break;
    }

    this.appDataService.entrieMode = this.type_entries;

    this.authService.currentUser.subscribe({
      complete: () => {
        if (
          this.authService.state &&
          this.authService.currentUserValue.access_type.includes('functional')
        ) {
          // GET USER LIST
          this.userService
            .getUsers()
            .then((response: Array<User>) => {
              this.users = response;
            })
            .catch(err => {
              console.log(err);
            });
        }
      }
    });
  }

  ngOnInit(): void {
    // PREPARE ORDER
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      this.setLocalStorageOrderValue();
    }

    // PREPARE VIEW MODE
    if (localStorage.getItem('homepageDisplayMode') === 'list') {
      this.viewOnList();
    } else {
      this.viewOnCard();
    }

    // INIT IMPORT FORM
    this.importForm = new UntypedFormGroup({
      import_file: new UntypedFormControl('', [])
    });
  }

  ngOnDestroy(): void {
    // TODO: Mode params
  }

  onCleanSearch(): void {
    this.searchText = '';
  }

  /**
   * Asort items created on PIA.
   */
  sortBy(fieldToSort: string): void {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sort();
    this.setLocalStorageOrderValue();
  }

  /**
   * Display elements in list view.
   */
  async viewOnList(): Promise<void> {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // TODO: Mode params
    await this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  async viewOnCard(): Promise<void> {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // TODO: Mode params
    await this.refreshContent();
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
          await this.piaService
            .getAllActives()
            .then(async (entries: Array<Pia>) => {
              this.entries = entries;

              // Remove example from list
              const index = this.entries.findIndex(p => p.is_example);
              if (index !== -1) {
                this.entries.splice(index, 1);
              }

              this.loading = false;
              this.startIntroJs('pia');
              this.sortOrder = localStorage.getItem('piaOrder');
              this.sortValue = localStorage.getItem('piaValue');
            });
          break;
        case 'archive':
          await this.piaService
            .findAllArchives()
            .then((entries: Array<Pia>) => {
              this.entries = entries;
              this.loading = false;
              this.sortOrder = localStorage.getItem('archiveOrder');
              this.sortValue = localStorage.getItem('archiveValue');
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
            this.sortOrder = localStorage.getItem('structureOrder');
            this.sortValue = localStorage.getItem('structureValue');
          });
          break;
        case 'knowledgeBase':
          await this.knowledgeBaseService
            .getAll()
            .then((result: KnowledgeBase[]) => {
              // Parse default Knowledge base json
              const defaultKnowledgeBase = new KnowledgeBase(
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
              this.sortOrder = localStorage.getItem('knowledgeBaseOrder');
              this.sortValue = localStorage.getItem('knowledgeBaseValue');
            });
          break;
        default:
          break;
      }
      this.sort();
    }, 200);
  }

  updateEntrie(entry): void {
    if (this.entries.includes(entry)) {
      this.entries.forEach(item => {
        if (item.id === entry.id) {
          item = entry;
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
   */
  onFormsubmitted(id, type: string = null): void {
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
          this.router.navigate(['knowledge_bases', id]);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Import a new PIA.
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
        (firstValue !== undefined && this.sortValue === 'name') ||
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
  setLocalStorageOrderValue(): void {
    switch (this.type_entries) {
      case 'pia':
        localStorage.setItem('piaOrder', this.sortOrder);
        localStorage.setItem('piaValue', this.sortValue);
        break;
      case 'archive':
        this.loading = false;
        localStorage.setItem('archiveOrder', this.sortOrder);
        localStorage.setItem('archiveValue', this.sortValue);
        break;
      case 'structure':
        localStorage.setItem('structureOrder', this.sortOrder);
        localStorage.setItem('structureValue', this.sortValue);
        break;
      case 'knowledgeBase':
        localStorage.setItem('knowledgeBaseOrder', this.sortOrder);
        localStorage.setItem('knowledgeBaseValue', this.sortValue);
        break;
      default:
        break;
    }
  }

  /**
   * Display pia create form ?
   */
  get showPiaForm(): boolean {
    return (
      (this.authService.state &&
        this.authService.currentUserValue.access_type.includes('functional')) ||
      !this.authService.state
    );
  }

  /**
   * Open Modal For new User
   */
  onNewUserNeeded($event): void {
    this.userBehavior = $event;
    this.showNewUserForm = true;
  }

  onUserAdded($event: User): void {
    this.userBehavior.next({ ...$event });
    this.userBehavior.complete();
    this.showNewUserForm = false;
    this.userBehavior = null;

    // update users
    this.users.push($event);
    this.users = this.users.slice();
  }

  onCancelUser(): void {
    this.userBehavior.next(null);
    this.userBehavior.complete();
    this.userBehavior = null;
    this.showNewUserForm = false;
  }

  /**
   * Open a dialog modal for deal with the conflict
   * @param err
   */
  conflictDialog(error: {
    field: string;
    err: { model: string; record: Pia | KnowledgeBase; params: any };
  }) {
    const err = error.err;
    let additional_text: string;
    let keep_initial: any;
    let keep_new: any;
    let merge: any;

    const currentUrl = this.router.url;
    switch (error.err.model) {
      case 'pia':
        // Text
        additional_text = `
          ${this.translateService.instant('conflict.title')}: ${error.field}
          <br>
          ${this.translateService.instant('conflict.initial_content')}: ${
          err.record[error.field]
        }
          <br>
          ${this.translateService.instant('conflict.new_content')}: ${
          err.params[error.field]
        }
        `;

        // keep initial action
        keep_initial = () => {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate([currentUrl]);
            });
          return;
        };

        // keep new action
        keep_new = () => {
          let newPiaFixed: Pia = <Pia>{ ...err.record };
          newPiaFixed[error.field] = err.params[error.field];
          newPiaFixed.id = err.record.id;
          newPiaFixed.lock_version = err.record.lock_version;
          this.piaService
            .update(newPiaFixed)
            .then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            })
            .catch(err => {});
        };

        // merge
        merge = () => {
          let newPiaFixed: Pia = <Pia>{ ...err.record };
          let separator = error.field === 'name' ? ' ' : ',';
          newPiaFixed[error.field] += separator + err.params[error.field];
          this.piaService
            .update(newPiaFixed)
            .then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            })
            .catch(err => {});
        };
        break;
      case 'knowledge_base':
        // Text
        additional_text = `
          ${this.translateService.instant('conflict.title')}: ${error.field}
          <br>
          ${this.translateService.instant('conflict.initial_content')}: ${
          err.record[error.field]
        }
          <br>
          ${this.translateService.instant('conflict.new_content')}: ${
          err.params[error.field]
        }
        `;

        // keep initial action
        keep_initial = () => {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate([currentUrl]);
            });
          return;
        };

        // keep new action
        keep_new = () => {
          let newKnwoledgeBaseFixed: KnowledgeBase = <KnowledgeBase>{
            ...err.record
          };
          newKnwoledgeBaseFixed[error.field] = err.params[error.field];
          newKnwoledgeBaseFixed.lock_version = err.record.lock_version;
          this.knowledgeBaseService
            .update(newKnwoledgeBaseFixed)
            .then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            })
            .catch(err => {});
        };

        // merge
        merge = () => {
          let newKnwoledgeBaseFixed: KnowledgeBase = <KnowledgeBase>{
            ...err.record
          };
          let separator = error.field === 'name' ? ' ' : ',';
          newKnwoledgeBaseFixed[error.field] +=
            separator + err.params[error.field];
          this.knowledgeBaseService
            .update(newKnwoledgeBaseFixed)
            .then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            })
            .catch(err => {});
        };
        break;
    }

    // Open dialog here
    this.dialogService.confirmThis(
      {
        text: this.translateService.instant('conflict.title'),
        type: 'others',
        yes: '',
        no: '',
        icon: 'pia-icons pia-icon-sad',
        data: {
          no_cross_button: true,
          btn_no: false,
          additional_text
        }
      },
      () => {
        return;
      },
      () => {
        return;
      },
      [
        {
          label: this.translateService.instant('conflict.keep_initial'),
          callback: () => {
            keep_initial();
          }
        },
        {
          label: this.translateService.instant('conflict.keep_new'),
          callback: () => {
            keep_new();
          }
        },
        {
          label: this.translateService.instant('conflict.merge'),
          callback: () => {
            merge();
          }
        }
      ]
    );
  }
}
