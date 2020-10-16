import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { ModalsService } from 'src/app/services/modals.service';

import piakb from 'src/assets/files/pia_knowledge-base.json';

@Component({
  selector: 'app-knowledgebase-card',
  templateUrl: './knowledgebase-card.component.html',
  styleUrls: ['./knowledgebase-card.component.scss']
})
export class KnowledgebaseCardComponent implements OnInit {
  knowledgeBaseForm: FormGroup;
  public nbEntries = 0;
  @Input() base: KnowledgeBase;


  constructor(private modalsService: ModalsService, private knowledgesService: KnowledgesService) {}

  ngOnInit(): void {
    this.knowledgeBaseForm = new FormGroup({
      id: new FormControl({ value: this.base.id, disabled: this.base.is_example }, null),
      name: new FormControl({ value: this.base.name, disabled: this.base.is_example }, null),
      author: new FormControl({ value: this.base.author, disabled: this.base.is_example }, null),
      contributors: new FormControl({ value: this.base.contributors, disabled: this.base.is_example }, null)
    });

    if (!this.base.is_example) {
      this.knowledgesService
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
  knowledgeBaseNameFocusIn(): void {
    this.knowledgeBaseForm.controls['name'].enable();
    // this.knowledgeBaseForm.nativeElement.focus();
  }
  knowledgeBaseAuthorFocusIn(): void {
    this.knowledgeBaseForm.controls['author'].enable();
    // this.knowledgeBaseForm.nativeElement.focus();
  }
  knowledgeBaseContributorsFocusIn(): void {
    this.knowledgeBaseForm.controls['contributors'].enable();
    // this.knowledgeBaseForm.nativeElement.focus();
  }

  /**
   * Disables Structure name field and saves data.
   */
  knowledgeBaseFocusOut(): void {
    let userText = this.knowledgeBaseForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.base.name = this.knowledgeBaseForm.value.name;
      this.base.author = this.knowledgeBaseForm.value.author;
      this.base.contributors = this.knowledgeBaseForm.value.contributors;
      this.base.update()
        .then((result) => {
          // this.structEvent.emit(this.structure);
        })
        .catch((err) => {

        });
    }
  }

  remove(id): void {
    this.knowledgesService.selected = id;
    this.modalsService.openModal('modal-remove-knowledgebase');
  }

  export(id): void {
    this.knowledgesService.export(id);
  }

  duplicate(id): void {
    this.knowledgesService.duplicate(id);
  }
}
