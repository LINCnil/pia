import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ModalsService } from 'src/app/modals/modals.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  knowledgeBaseForm: FormGroup;
  @Input() base: any;

  constructor(private _modalsService: ModalsService, private _knowledgesService: KnowledgesService) {}

  ngOnInit() {
    this.knowledgeBaseForm = new FormGroup({
      id: new FormControl(this.base.id),
      name: new FormControl(this.base.name),
      author: new FormControl(this.base.author),
      contributors: new FormControl(this.base.contributors)
    });
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
}
