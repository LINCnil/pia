import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalsService } from 'src/app/modals/modals.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import piakb from 'src/assets/files/pia_knowledge-base.json';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  providers: [ModalsService]
})
export class CardComponent implements OnInit {
  knowledgeBaseForm: FormGroup;
  public nbEntries: number = 0;
  @Input() base: KnowledgeBase;

  constructor(private _modalsService: ModalsService, private _knowledgesService: KnowledgesService) {}

  ngOnInit() {
    this.knowledgeBaseForm = new FormGroup({
      id: new FormControl({ value: this.base.id, disabled: this.base.is_example }, Validators.required),
      name: new FormControl({ value: this.base.name, disabled: this.base.is_example }, Validators.required),
      author: new FormControl({ value: this.base.author, disabled: this.base.is_example }, Validators.required),
      contributors: new FormControl({ value: this.base.contributors, disabled: this.base.is_example }, Validators.required)
    });

    if (!this.base.is_example) {
      this._knowledgesService
        .getEntries(this.base.id)
        .then((result: Knowledge[]) => {
          this.nbEntries = result.length;
        })
        .catch(err => {
          console.log('catch');
        });
    } else {
      // exemple
      this.nbEntries = piakb.length;
    }
  }

  /**
   * Focuses Structure name field.
   */
  knowledgeBaseNameFocusIn() {
    this.knowledgeBaseForm.controls['name'].enable();
    // this.knowledgeBaseForm.nativeElement.focus();
  }
  knowledgeBaseAuthorFocusIn() {
    this.knowledgeBaseForm.controls['author'].enable();
    // this.knowledgeBaseForm.nativeElement.focus();
  }
  knowledgeBaseContributorsFocusIn() {
    this.knowledgeBaseForm.controls['contributors'].enable();
    // this.knowledgeBaseForm.nativeElement.focus();
  }

  /**
   * Disables Structure name field and saves data.
   */
  knowledgeBaseFocusOut() {
    let userText = this.knowledgeBaseForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.base.name = this.knowledgeBaseForm.value.name;
      this.base.author = this.knowledgeBaseForm.value.author;
      this.base.contributors = this.knowledgeBaseForm.value.contributors;
      this.base.update();
      // this.structEvent.emit(this.structure);
    }
  }

  remove(id) {
    this._knowledgesService.selected = id;
    this._modalsService.openModal('modal-remove-knowledgebase');
  }

  export(id) {
    this._knowledgesService.export(id);
  }

  duplicate(id) {
    this._knowledgesService.duplicate(id);
  }
}
