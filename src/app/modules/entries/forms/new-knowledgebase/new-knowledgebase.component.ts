import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';

@Component({
  selector: 'app-new-knowledgebase',
  templateUrl: './new-knowledgebase.component.html',
  styleUrls: ['./new-knowledgebase.component.scss']
})
export class NewKnowledgebaseComponent implements OnInit {
  @Output() submited = new EventEmitter();
  knowledgeBaseForm: FormGroup;

  constructor(private knowledgeBaseService: KnowledgeBaseService) { }

  ngOnInit(): void {
    this.knowledgeBaseForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl(),
      contributors: new FormControl()
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
    this.knowledgeBaseService.create(kb)
      .then((result: KnowledgeBase) => {
        this.submited.emit(result.id);
      });
  }

}
