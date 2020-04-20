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
  entryForm: FormGroup;
  showNewEntry: Boolean = false;

  constructor(private _modalsService: ModalsService, private _knowledgesService: KnowledgesService, private route: ActivatedRoute) {}

  async ngOnInit() {
    let sectionId = parseInt(this.route.snapshot.params.id, 10);
    this._knowledgesService.selected = sectionId;
    this.base = new KnowledgeBase();
    this.base
      .get(sectionId)
      .then(() => {})
      .catch(() => {});

    // Init Form
    this.entryForm = new FormGroup({
      name: new FormControl(),
      category: new FormControl()
    });
  }

  onSubmit() {
    let entry = new Knowledge();
    entry.name = this.entryForm.value.name;
    entry.slug = slugify(entry.name);
    entry.category = this.entryForm.value.category;
    this.base.addEntry(entry);
  }
}
