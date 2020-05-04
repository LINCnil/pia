import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ModalsService } from 'src/app/modals/modals.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { Knowledge } from 'src/app/models/knowledge.model';
import piakb from 'src/assets/files/pia_knowledge-base.json';
import { AppDataService } from 'src/app/services/app-data.service';
import { LanguagesService } from 'src/app/services/languages.service';

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
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {
  base: KnowledgeBase = null;
  knowledges: Knowledge[] = [];
  entryForm: FormGroup;
  editMode: 'edit' | 'new';
  showForm: boolean = false;
  selectedKnowledgeId: number;
  categories: string[] = [];
  filters: string[] = [];
  data: any;
  itemsSelected: any = [];
  lockedChoice: boolean = false;

  filtersCategoriesCorrespondance = {
    'knowledge_base.category.measure_on_data': 'measure.data_processing',
    'knowledge_base.category.general_measure': 'measure.security',
    'knowledge_base.category.organizational_measure': 'measure.goverance',
    'knowledge_base.category.definition': 'measure.definition'
  };

  constructor(
    private _languagesService: LanguagesService,
    private _modalsService: ModalsService,
    private _knowledgesService: KnowledgesService,
    private _appDataService: AppDataService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    let sectionId = parseInt(this.route.snapshot.params.id, 10);
    this._knowledgesService.selected = sectionId;
    this.base = new KnowledgeBase();
    this.base
      .get(sectionId)
      .then(() => {
        // GET Knowledges entries from selected base
        this._knowledgesService.getEntries(this.base.id).then((result: Knowledge[]) => {
          this.knowledges = result;
        });
      })
      .catch(() => {});

    // Init Form
    this.entryForm = new FormGroup({
      name: new FormControl(),
      category: new FormControl(),
      description: new FormControl()
    });

    // get default categories
    for (var item of piakb) {
      if (!this.categories.includes(item.category)) {
        this.categories.push(item.category);
      }
    }
    // get default filters
    for (var item of piakb) {
      if (!this.filters.includes(item.filters) && item.filters !== '') {
        this.filters.push(item.filters);
      }
    }
    this.data = this._appDataService.dataNav;
  }

  checkLockedChoice() {
    console.log('passing');
    if (
      this.entryForm.value.category === 'knowledge_base.category.organizational_measure' ||
      this.entryForm.value.category === 'knowledge_base.category.measure_on_data' ||
      this.entryForm.value.category === 'knowledge_base.category.general_measure'
    ) {
      this.lockedChoice = true;
      return true;
    } else {
      this.lockedChoice = false;
      return false;
    }
  }

  checkFilters() {
    if (
      this.entryForm.value.category === 'knowledge_base.category.organizational_measure' ||
      this.entryForm.value.category === 'knowledge_base.category.measure_on_data' ||
      this.entryForm.value.category === 'knowledge_base.category.general_measure' ||
      this.entryForm.value.category === 'knowledge_base.category.definition'
    ) {
      return this.filtersCategoriesCorrespondance[this.entryForm.value.category];
    } else {
      this.lockedChoice = false;
      return '';
    }
  }

  /**
   * Create a new Knowledge entry
   */
  onSubmit() {
    let entry = new Knowledge();

    entry.name = this.entryForm.value.name;
    entry.slug = slugify(entry.name);
    entry.category = this.entryForm.value.category;
    entry.description = this.entryForm.value.description;

    if (this.checkLockedChoice()) {
      entry.items = ['31'];
      this.itemsSelected = ['31'];
    }

    entry.filters = this.checkFilters();

    entry.create(this._knowledgesService.selected).then((result: Knowledge) => {
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
  editEntry(id) {
    this.selectedKnowledgeId = id;
    let tempk = new Knowledge();
    tempk
      .find(id)
      .then((result: Knowledge) => {
        // SET FORM CONTROL

        this.entryForm.controls['name'].setValue(result.name);
        this.entryForm.controls['category'].setValue(result.category);
        this.entryForm.controls['description'].setValue(result.description);
        this.itemsSelected = [];
        if (result.items) {
          this.itemsSelected = result.items;
        }
        // SHOW FORM
        this.checkLockedChoice();

        this.editMode = 'edit';
        this.showForm = true;
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteEntry(id) {
    let tempk = new Knowledge();
    tempk
      .delete(id)
      .then(() => {
        let index = this.knowledges.findIndex(e => e.id === id);
        if (index !== -1) {
          this.knowledges.splice(index, 1);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * One shot update
   */
  focusOut() {
    if (this.selectedKnowledgeId) {
      let entry = new Knowledge();
      entry.get(this.selectedKnowledgeId).then(() => {
        // set new properties values
        entry.name = this.entryForm.value.name;
        entry.description = this.entryForm.value.description;
        entry.slug = slugify(entry.name);
        entry.category = this.entryForm.value.category;
        entry.description = this.entryForm.value.description;
        entry.items = this.itemsSelected;

        if (this.checkLockedChoice()) {
          entry.items = ['31'];
          this.itemsSelected = ['31'];
        }

        entry.filters = this.checkFilters();

        // Update object
        entry
          .update()
          .then(() => {
            // Update list
            let index = this.knowledges.findIndex(e => e.id == entry.id);
            if (index !== -1) {
              this.knowledges[index] = entry;
            }
          })
          .catch(err => {
            console.log(err);
          });
      });
    }
  }

  /**
   * Record every change on each item checkbox.
   */
  onCheckboxChange(e) {
    let ar = this.itemsSelected;
    if (e.target.checked) {
      ar.push(e.target.value);
    } else {
      let index = ar.findIndex(item => item == e.target.value);
      if (index !== -1) {
        ar.splice(index, 1);
      }
    }
    this.itemsSelected = ar;
    this.focusOut();
  }

  /**
   * Check all items when the section checkbox is clicked.
   */
  globalCheckingElementInDataSection(dataSection, e) {
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
  globalCheckingAllElementInDataSection(e) {
    const checkboxStatus = e.target.checked;
    const checkboxesTitle = e.target.parentNode.parentNode.querySelectorAll('.pia-knowledges_base-form-checkboxes-title');
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
  sectionCheckedVerification(dataSection) {
    let checked = true;
    dataSection.items.forEach(item => {
      if (!this.itemsSelected.includes(`${dataSection.id}${item.id}`)) {
        checked = false;
      }
    });
    return checked;
  }

  /**
   * Verify every checkboxes to check or uncheck the "all section" checkbox.
   */
  allSectionCheckedVerification(sections) {
    let allChecked = true;
    sections.forEach(section => {
      if (!this.sectionCheckedVerification(section)) {
        allChecked = false;
      }
    });
    const checkboxAllSections = document.getElementById('select_all_sections') as HTMLInputElement;
    checkboxAllSections.checked = allChecked;
  }

  /**
   * Open or close the form.
   */
  closeNewElementForm() {
    this.showForm = false;
  }
}
