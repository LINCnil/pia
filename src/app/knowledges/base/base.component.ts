import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ModalsService } from 'src/app/modals/modals.service';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Knowledge } from 'src/app/models/knowledge.model';

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

  constructor(private _modalsService: ModalsService, private _knowledgesService: KnowledgesService, private route: ActivatedRoute) {}

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
  }

  // CREATE OR UPDATE
  onSubmit() {
    let entry = new Knowledge();

    entry.name = this.entryForm.value.name;
    entry.slug = slugify(entry.name);
    entry.category = this.entryForm.value.category;
    entry.description = this.entryForm.value.description;

    entry.create(this._knowledgesService.selected).then((result: Knowledge) => {
      this.knowledges.push(result);
      this.entryForm.reset();
      this.showForm = false;
    });
  }

  editEntry(id) {
    let tempk = new Knowledge();
    tempk
      .find(id)
      .then((result: Knowledge) => {
        // SET FORM CONTROL
        this.entryForm.setValue({
          name: result.name,
          category: result.category,
          description: result.description
        });
        // SHOW FORM
        this.editMode = 'edit';
        this.showForm = true;
      })
      .catch(err => {
        console.log(err);
      });
  }
}
