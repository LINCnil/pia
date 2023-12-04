import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { reject } from 'cypress/types/bluebird';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';

@Component({
  selector: 'app-new-knowledgebase',
  templateUrl: './new-knowledgebase.component.html',
  styleUrls: ['../form.component.scss']
})
export class NewKnowledgebaseComponent implements OnInit {
  @Output() submitted = new EventEmitter();
  knowledgeBaseForm: UntypedFormGroup;

  constructor(private knowledgeBaseService: KnowledgeBaseService) {}

  ngOnInit(): void {
    this.knowledgeBaseForm = new UntypedFormGroup({
      name: new UntypedFormControl(),
      author: new UntypedFormControl(),
      contributors: new UntypedFormControl()
    });
  }

  onSubmit(): void {
    const kb = new KnowledgeBase(
      null,
      this.knowledgeBaseForm.value.name,
      this.knowledgeBaseForm.value.author,
      this.knowledgeBaseForm.value.contributors,
      new Date()
    );
    this.knowledgeBaseService
      .create(kb)
      .then((result: KnowledgeBase) => {
        this.submitted.emit(result.id);
      })
      .catch(err => {
        console.error(err);
      });
  }
}
