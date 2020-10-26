import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Structure } from 'src/app/models/structure.model';
import { DialogService } from 'src/app/services/dialog.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
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
  @Output() changed = new EventEmitter<Structure>();
  @Output() duplicated = new EventEmitter<Structure>();
  @Output() deleted = new EventEmitter<any>();


  constructor(
    private modalsService: ModalsService,
    private knowledgesService: KnowledgesService,
    private knowledgeBaseService: KnowledgeBaseService,
    private dialogService: DialogService) {}

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
      this.knowledgeBaseService.update(this.base)
        .then((result) => {
          // this.structEvent.emit(this.structure);
        })
        .catch((err) => {

        });
    }
  }

  remove(id): void {
    // this.knowledgesService.selected = id;
    // this.modalsService.openModal('modal-remove-knowledgebase');
    this.dialogService.confirmThis({
      text: 'modals.knowledges.content',
      type: 'confirm',
      yes: 'modals.knowledges.remove',
      no: 'modals.cancel'},
      () => {
        this.knowledgeBaseService.delete(id)
          .then(() => {
            this.deleted.emit();
          })
          .catch(() => {
            return;
          });
      },
      () => {
        return;
      });
  }

  export(id): void {
    this.knowledgeBaseService.export(id);
  }

  duplicate(id): void {
    this.knowledgeBaseService.duplicate(id);
    this.duplicated.emit(id);
  }
}
