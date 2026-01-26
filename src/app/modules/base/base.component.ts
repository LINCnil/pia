import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { AppDataService } from 'src/app/services/app-data.service';
import { DialogService } from 'src/app/services/dialog.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { LanguagesService } from 'src/app/services/languages.service';
import piakb from 'src/assets/files/pia_knowledge-base.json';
import {
  faFolderOpen,
  faTrash,
  faFile,
  faCopy
} from '@fortawesome/free-solid-svg-icons';

function slugify(text): string {
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
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  standalone: false
})
export class BaseComponent implements OnInit {
  base: KnowledgeBase = null;
  knowledges: Knowledge[] | any[] = [];
  entryForm: UntypedFormGroup;
  editMode: 'edit' | 'new';
  showForm = false;
  selectedKnowledgeId: number;
  categories: string[] = [];
  filters: string[] = [];
  data: any;
  itemsSelected: any = [];
  lockedChoice = false;
  loadingEntry = false;

  filtersCategoriesCorrespondance = {
    'knowledge_base.category.measure_on_data': 'measure.data_processing',
    'knowledge_base.category.general_measure': 'measure.security',
    'knowledge_base.category.organizational_measure': 'measure.governance',
    'knowledge_base.category.definition': 'measure.definition'
  };

  protected readonly faFolderOpen = faFolderOpen;
  protected readonly faTrash = faTrash;
  protected readonly faFile = faFile;

  constructor(
    private router: Router,
    public languagesService: LanguagesService,
    private translateService: TranslateService,
    private knowledgesService: KnowledgesService,
    private knowledgeBaseService: KnowledgeBaseService,
    private appDataService: AppDataService,
    private dialogService: DialogService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.appDataService.entrieMode = 'knowledgeBase';
    this.base = new KnowledgeBase();
    const sectionId = parseInt(this.route.snapshot.params.id, 10);
    if (sectionId) {
      this.knowledgeBaseService
        .get(sectionId)
        .then((base: KnowledgeBase) => {
          this.base = base;
          // GET Knowledges entries from selected base
          this.knowledgesService
            .getEntries(this.base.id)
            .then((result: Knowledge[]) => {
              this.knowledges = result;
            });
        })
        .catch(() => {});

      // Init Form
      this.entryForm = new UntypedFormGroup({
        name: new UntypedFormControl(),
        category: new UntypedFormControl(),
        description: new UntypedFormControl(),
        lock_version: new UntypedFormControl()
      });

      // get default categories
      for (const item of piakb) {
        if (!this.categories.includes(item.category)) {
          this.categories.push(item.category);
        }
      }
      // get default filters
      for (const item of piakb) {
        if (!this.filters.includes(item.filters) && item.filters !== '') {
          this.filters.push(item.filters);
        }
      }
      this.data = this.appDataService.dataNav;
    } else {
      this.base = new KnowledgeBase(
        0,
        this.translateService.instant('knowledge_base.default_knowledge_base'),
        'CNIL',
        'CNIL'
      );
      this.base.is_example = true;
      this.knowledges = piakb;

      // Init Form
      this.entryForm = new UntypedFormGroup({
        name: new UntypedFormControl({ disabled: true }),
        category: new UntypedFormControl({ disabled: true }),
        description: new UntypedFormControl({ disabled: true }),
        lock_version: new UntypedFormControl({ disabled: true })
      });
    }
  }

  checkLockedChoice(): boolean {
    if (
      this.entryForm.value.category ===
        'knowledge_base.category.organizational_measure' ||
      this.entryForm.value.category ===
        'knowledge_base.category.measure_on_data' ||
      this.entryForm.value.category ===
        'knowledge_base.category.general_measure'
    ) {
      this.lockedChoice = true;
      this.itemsSelected = ['31'];
      return true;
    } else {
      this.lockedChoice = false;
      const index = this.itemsSelected.findIndex(e => e === '31');
      if (index !== -1) {
        this.itemsSelected.splice(index, 1);
      }
      return false;
    }
  }

  checkFilters(): string {
    if (
      this.entryForm.value.category ===
        'knowledge_base.category.organizational_measure' ||
      this.entryForm.value.category ===
        'knowledge_base.category.measure_on_data' ||
      this.entryForm.value.category ===
        'knowledge_base.category.general_measure' ||
      this.entryForm.value.category === 'knowledge_base.category.definition'
    ) {
      return this.filtersCategoriesCorrespondance[
        this.entryForm.value.category
      ];
    } else {
      return '';
    }
  }

  /**
   * Create a new Knowledge entry
   */
  onSubmit(): void {
    const entry = new Knowledge();

    entry.name = this.entryForm.value.name;
    entry.description = this.entryForm.value.description;
    entry.slug = slugify(entry.name);
    entry.category = this.entryForm.value.category;
    entry.items = this.itemsSelected.map(x => parseInt(x));
    entry.filters = this.checkFilters();
    entry.created_at = new Date();
    entry.updated_at = entry.created_at;

    this.knowledgesService
      .add(this.base.id, entry)
      .then((result: Knowledge) => {
        this.knowledges.push(result);
        this.entryForm.reset();
        this.showForm = false;
        this.editEntry(result.id); // Go to edition mode
      });
  }

  /**
   * Open form in edition mode, with preset values
   * @param id Knowledge entry's id
   */
  editEntry(id): void {
    if (id) {
      this.loadingEntry = true;
      this.selectedKnowledgeId = id;
      this.knowledgesService
        .find(id)
        .then((result: Knowledge) => {
          this.entryForm.controls['name'].setValue(result.name);
          this.entryForm.controls['category'].setValue(result.category);
          this.entryForm.controls['description'].setValue(result.description);
          this.entryForm.controls['lock_version'].setValue(result.lock_version);
          this.itemsSelected = [];
          if (result.items) {
            this.itemsSelected = result.items.map(x => x.toString());
          }
          this.checkLockedChoice();

          // Update list
          const index = this.knowledges.findIndex(e => e.id === result.id);
          if (index !== -1) {
            this.knowledges[index] = result;
          }

          this.editMode = 'edit';
          this.showForm = true;
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          this.loadingEntry = false;
        });
    }
  }

  duplicate(id): void {
    this.knowledgesService
      .duplicate(this.base.id, id)
      .then((entry: Knowledge) => {
        this.knowledges.push(entry);
      })
      .catch(err => {
        console.error(err);
      });
  }

  delete(id): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.knowledge.content',
        type: 'confirm',
        yes: 'modals.knowledge.remove',
        no: 'modals.cancel',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.knowledgesService
          .delete(id)
          .then(() => {
            const index = this.knowledges.findIndex(e => e.id === id);
            if (index !== -1) {
              this.knowledges.splice(index, 1);
            }
          })
          .catch(() => {
            return;
          });
      },
      () => {
        return;
      }
    );
  }

  /**
   * One shot update
   */
  focusOut(field?: string): void {
    if (this.selectedKnowledgeId) {
      const entry = { ...this.entryForm.value };
      entry.id = this.selectedKnowledgeId;
      entry.updated_at = new Date();
      entry.slug = slugify(entry.name);
      entry.category = this.entryForm.value.category;
      entry.lock_version = this.entryForm.value.lock_version;
      entry.items = this.itemsSelected.map(x => parseInt(x));
      entry.filters = this.checkFilters();
      entry.knowledge_base_id = this.base.id;
      this.knowledgesService
        .update(entry)
        .then(response => {
          this.entryForm.controls.lock_version.setValue(response.lock_version);
          // Update list
          const index = this.knowledges.findIndex(e => e.id === entry.id);
          if (index !== -1) {
            this.knowledges[index] = response;
          }
        })
        .catch(err => {
          if (err.statusText === 'Conflict' && field) {
            // AUTO FIX checkboxes conflict, here because we have to update form
            // force entry with the new lock_version
            if (field === 'checkbox') {
              entry.name = err.record.name;
              entry.description = err.record.description;
              entry.lock_version = err.record.lock_version;
              this.knowledgesService
                .update(entry)
                .then(kbFixed => {
                  // Update list
                  const index = this.knowledges.findIndex(
                    e => e.id === entry.id
                  );
                  if (index !== -1) {
                    this.knowledges[index] = entry;
                  }
                  // Update form
                  this.entryForm.controls.name.setValue(kbFixed.name);
                  this.entryForm.controls.description.setValue(
                    kbFixed.description
                  );
                  this.entryForm.controls.lock_version.setValue(
                    kbFixed.lock_version
                  );
                  if (kbFixed.items) {
                    this.itemsSelected = kbFixed.items.map(x => x.toString());
                  }
                  this.checkLockedChoice();
                })
                .catch(err => {
                  console.log(err);
                });
            } else {
              // Normal conflict dialog
              this.conflictDialog(field, err);
            }
          }
        });
    }
  }

  /**
   * Record every change on each item checkbox.
   */
  onCheckboxChange(event: Event): void {
    const checkboxValue = (event.target as HTMLInputElement).value;
    const isChecked = (event.target as HTMLInputElement).checked;

    // Update itemsSelected immutably
    this.itemsSelected = isChecked
      ? [...this.itemsSelected, checkboxValue]
      : this.itemsSelected.filter(item => item !== checkboxValue);
    this.focusOut('checkbox');
  }

  /**
   * Check all items when the section checkbox is clicked.
   */
  globalCheckingElementInDataSection(dataSection: any, event: Event): void {
    const checkboxStatus = (event.target as HTMLInputElement).checked;

    const updatedItemsSelected = [...this.itemsSelected];

    const allowedCategories = [
      'knowledge_base.category.organizational_measure',
      'knowledge_base.category.measure_on_data',
      'knowledge_base.category.general_measure',
      'knowledge_base.category.definition'
    ];

    const category = this.entryForm.value.category;

    dataSection.items.forEach(item => {
      const itemId = `${dataSection.id}${item.id}`;
      const index = updatedItemsSelected.indexOf(itemId);

      if (checkboxStatus && index === -1) {
        // Special case: item "31" is only added if the current category is one of the measure ones
        if (itemId === '31' && !allowedCategories.includes(category)) {
          return;
        }
        updatedItemsSelected.push(itemId);
      } else if (!checkboxStatus && index !== -1) {
        updatedItemsSelected.splice(index, 1);
      }
    });

    this.itemsSelected = updatedItemsSelected;
    this.focusOut('checkbox');
  }

  /**
   * Check all sections when the "all sections" checkbox is clicked.
   */
  globalCheckingAllElementInDataSection(event: Event): void {
    const checkboxStatus = (event.target as HTMLInputElement).checked;

    const updatedItemsSelected = [];

    const allowedCategories = [
      'knowledge_base.category.organizational_measure',
      'knowledge_base.category.measure_on_data',
      'knowledge_base.category.general_measure',
      'knowledge_base.category.definition'
    ];

    const category = this.entryForm.value.category;

    this.data.sections.forEach(section => {
      section.items.forEach(item => {
        const itemId = `${section.id}${item.id}`;
        if (checkboxStatus) {
          // Special case: item "31" is only added if the current category is one of the measure ones
          if (itemId === '31' && !allowedCategories.includes(category)) {
            return;
          }
          updatedItemsSelected.push(itemId);
        }
      });
    });

    this.itemsSelected = checkboxStatus ? updatedItemsSelected : [];
    this.focusOut('checkbox');
  }

  trackByKnowledgeId(index: number, item: Knowledge): number {
    return item.id; // Use the unique ID of the knowledge item
  }

  /**
   * Checked the parent checkbox attribute
   */
  sectionCheckedVerification(dataSection: any): boolean {
    return dataSection.items.every(item =>
      this.itemsSelected.includes(`${dataSection.id}${item.id}`)
    );
  }

  /**
   * Verify every checkboxes to check or uncheck the "all section" checkbox.
   */
  allSectionCheckedVerification(sections: any[]): boolean {
    return sections.every(section =>
      section.items.every(item =>
        this.itemsSelected.includes(`${section.id}${item.id}`)
      )
    );
  }

  /**
   * Open or close the form.
   */
  closeNewElementForm(): void {
    this.showForm = false;
  }

  /**
   * Open a dialog modal for deal with the conflict
   * @param err
   */
  conflictDialog(field, error) {
    let additional_text: string;
    const currentUrl = this.router.url;
    // Text
    additional_text = `
      ${this.translateService.instant('conflict.pia_field_name')}:
      ${field}
      <br>
      ${this.translateService.instant('conflict.initial_content')}:
      ${error.record[field]}
      <br>
      ${this.translateService.instant('conflict.new_content')}:
      ${error.params[field]}
    `;

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
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate([currentUrl]);
              });
            return;
          }
        },
        {
          label: this.translateService.instant('conflict.keep_new'),
          callback: () => {
            let newKnowledgeFixed: Knowledge = { ...error.params };
            newKnowledgeFixed.id = error.record.id;
            newKnowledgeFixed.lock_version = error.record.lock_version;
            this.knowledgesService.update(newKnowledgeFixed).then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            });
          }
        },
        {
          label: this.translateService.instant('conflict.merge'),
          callback: () => {
            let newKnowledgeFixed: Knowledge = { ...error.record };
            let separator = field === 'title' ? ' ' : '\n';
            newKnowledgeFixed[field] += separator + error.params[field];
            this.knowledgesService.update(newKnowledgeFixed).then(() => {
              this.router
                .navigateByUrl('/', { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([currentUrl]);
                });
              return;
            });
          }
        }
      ]
    );
  }

  protected readonly faCopy = faCopy;
}
