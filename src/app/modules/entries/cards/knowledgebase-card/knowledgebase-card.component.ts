import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Knowledge } from 'src/app/models/knowledge.model';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Structure } from 'src/app/models/structure.model';
import { DialogService } from 'src/app/services/dialog.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';

import piakb from 'src/assets/files/pia_knowledge-base.json';

@Component({
  selector: 'app-knowledgebase-card',
  templateUrl: './knowledgebase-card.component.html',
  styleUrls: ['./knowledgebase-card.component.scss']
})
export class KnowledgebaseCardComponent implements OnInit {
  knowledgeBaseForm: UntypedFormGroup;
  public nbEntries = 0;
  @Input() base: KnowledgeBase;
  @Output() changed = new EventEmitter<Structure>();
  @Output() duplicated = new EventEmitter<Structure>();
  @Output() deleted = new EventEmitter<any>();
  @Output() conflictDetected = new EventEmitter<{ field: string; err: any }>();

  constructor(
    private knowledgesService: KnowledgesService,
    private knowledgeBaseService: KnowledgeBaseService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.knowledgeBaseForm = new UntypedFormGroup({
      id: new UntypedFormControl(
        { value: this.base.id, disabled: this.base.is_example },
        null
      ),
      name: new UntypedFormControl(
        { value: this.base.name, disabled: this.base.is_example },
        null
      ),
      author: new UntypedFormControl(
        { value: this.base.author, disabled: this.base.is_example },
        null
      ),
      contributors: new UntypedFormControl(
        { value: this.base.contributors, disabled: this.base.is_example },
        null
      )
    });

    if (!this.base.is_example) {
      this.knowledgesService
        .getEntries(this.base.id)
        .then((result: Knowledge[]) => {
          this.nbEntries = result.length;
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      // example
      this.nbEntries = piakb.length;
    }
  }

  /**
   * Focuses Structure name field.
   */
  knowledgeBaseNameFocusIn(): void {
    this.knowledgeBaseForm.controls['name'].enable();
  }
  knowledgeBaseAuthorFocusIn(): void {
    this.knowledgeBaseForm.controls['author'].enable();
  }
  knowledgeBaseContributorsFocusIn(): void {
    this.knowledgeBaseForm.controls['contributors'].enable();
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
      this.knowledgeBaseService
        .update(this.base)
        .then((response: KnowledgeBase) => {
          this.base = response;
        })
        .catch(err => {
          if (err.statusText === 'Conflict') {
            this.conflictDetected.emit({ field: 'name', err });
          }
        });
    }
  }

  remove(id): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.knowledges.content',
        type: 'confirm',
        yes: 'modals.knowledges.remove',
        no: 'modals.cancel',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.knowledgeBaseService
          .delete(id)
          .then(() => {
            this.deleted.emit();
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

  export(id): void {
    this.knowledgeBaseService.export(id);
  }

  duplicate(id): void {
    this.knowledgeBaseService.duplicate(id);
    this.duplicated.emit(id);
  }
}
