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
  styleUrls: ['./base.component.scss']
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
  onCheckboxChange(e): void {
    const ar = this.itemsSelected;
    if (e.target.checked) {
      ar.push(e.target.value);
    } else {
      const index = ar.findIndex(
        item => item.toString() == e.target.value.toString()
      );
      if (index !== -1) {
        ar.splice(index, 1);
      }
    }
    this.itemsSelected = ar;
    this.focusOut('checkbox');
  }

  /**
   * Check all items when the section checkbox is clicked.
   */
  globalCheckingElementInDataSection(dataSection, e): void {
    const checkboxStatus = e.target.checked;
    const checkboxes = e.target.parentNode.parentNode
      .querySelector('.pia-knowledges_base-form-checkboxes-list')
      .querySelectorAll('[type="checkbox"]');
    if (checkboxes) {
      checkboxes.forEach((checkboxElement: HTMLInputElement) => {
        if (checkboxStatus && !checkboxElement.checked) {
          checkboxElement.click();
        } else if (!checkboxStatus && checkboxElement.checked) {
          checkboxElement.click();
        }
      });
    }
  }

  /**
   * Check all sections when the "all sections" checkbox is clicked.
   */
  globalCheckingAllElementInDataSection(e): void {
    const checkboxStatus = e.target.checked;
    const checkboxesTitle = e.target.parentNode.parentNode.querySelectorAll(
      '.pia-knowledges_base-form-checkboxes-title'
    );
    if (checkboxesTitle) {
      checkboxesTitle.forEach(el => {
        const checkboxElement = el.querySelector('[type="checkbox"]');
        if (checkboxElement) {
          if (checkboxStatus && !checkboxElement.checked) {
            checkboxElement.click();
          } else if (!checkboxStatus && checkboxElement.checked) {
            checkboxElement.click();
          }
        }
      });
    }
  }

  /**
   * Checked the parent checkbox attribute
   */
  sectionCheckedVerification(dataSection): boolean {
    let checked = true;
    dataSection.items.forEach(item => {
      if (!this.itemsSelected.includes(`${dataSection.id}${item.id}`)) {
        if (!this.lockedChoice && `${dataSection.id}${item.id}` === '31') {
          return;
        }
        checked = false;
      }
    });
    return checked;
  }

  /**
   * Verify every checkboxes to check or uncheck the "all section" checkbox.
   */
  allSectionCheckedVerification(sections): void {
    let allChecked = true;
    sections.forEach(section => {
      if (!this.sectionCheckedVerification(section)) {
        allChecked = false;
      }
    });
    const checkboxAllSections = document.getElementById(
      'select_all_sections'
    ) as HTMLInputElement;
    checkboxAllSections.checked = allChecked;
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
}
