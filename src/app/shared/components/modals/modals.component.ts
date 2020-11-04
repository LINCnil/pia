import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';
import { Pia } from 'src/app/models/pia.model';
import { Structure } from 'src/app/models/structure.model';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';
import { ArchiveService } from 'src/app/services/archive.service';
import { KnowledgesService } from 'src/app/services/knowledges.service';
import { LanguagesService } from 'src/app/services/languages.service';
import { ModalsService } from 'src/app/services/modals.service';
import { PiaService } from 'src/app/services/pia.service';
import { StructureService } from 'src/app/services/structure.service';
import { MeasureService } from 'src/app/services/measures.service';
import { AttachmentsService } from 'src/app/services/attachments.service';



@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss'],
  providers: [PiaService, ArchiveService, StructureService]
})
export class ModalsComponent implements OnInit, OnDestroy {
  @Input() pia: any;
  @Input() structure: any;
  @Output() continueEvent = new EventEmitter();

  @Input() revisionPreview: any;

  subscription: Subscription;
  newPia: Pia;
  newStructure: Structure;
  piaForm: FormGroup;
  structureForm: FormGroup;
  knowledgeBaseForm: FormGroup;
  removeAttachmentForm: FormGroup;
  enableSubmit = true;

  constructor(
    private router: Router,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    public _archiveService: ArchiveService,
    public _structureService: StructureService,
    public _answerStructureService: AnswerStructureService,
    public _measuresService: MeasureService,
    public _attachmentsService: AttachmentsService,
    private _translateService: TranslateService,
    public _languagesService: LanguagesService,
    public _knowledgesService: KnowledgesService
  ) {}

  ngOnInit() {
    this.subscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {});
    const structure = new Structure();
    // structure.getAll().then((data: any) => {
    //   this._structureService.structures = data;
    // });

    // this._piaService.getPIA();
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl(),
      category: new FormControl(),
      structure: new FormControl([])
    });
    this.structureForm = new FormGroup({
      name: new FormControl(),
      sector_name: new FormControl()
    });
    this.removeAttachmentForm = new FormGroup({
      comment: new FormControl()
    });
    this.newPia = new Pia();
    this.newStructure = new Structure();

    this.knowledgeBaseForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl(),
      contributors: new FormControl()
    });
  }

  /**
   * Returns to homepage (used on several modals).
   */
  returnToHomepage() {
    this._modalsService.closeModal();
    this.router.navigate(['/home']);
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   */
  onSubmit() {
    this._piaService.saveNewPia(this.piaForm).then((id: number) => {
      this.router.navigate(['entry', id, 'section', 1, 'item', 1]);
    });
  }

  /**
   * Save the newly created Structure.
   * Sends to the path associated to this new Structure.
   */
  // onSubmitStructure() {
  //   const structure = new Structure();
  //   structure.name = this.structureForm.value.name;
  //   structure.sector_name = this.structureForm.value.sector_name;
  //   structure.data = this._piaService.data;
  //   const p = structure.create();
  //   p.then(id => this.router.navigate(['structures', 'entry', id, 'section', 1, 'item', 1]));
  // }

  // onSubmitKnowledgeBase() {
  //   const kb = new KnowledgeBase();
  //   kb.name = this.knowledgeBaseForm.value.name;
  //   kb.author = this.knowledgeBaseForm.value.author;
  //   kb.contributors = this.knowledgeBaseForm.value.contributors;
  //   kb.create().then((result: KnowledgeBase) => this.router.navigate(['knowledges', 'base', result.id]));
  // }

  /**
   * Focuses out from the comment attachment field.
   */
  attachmentCommentFocusOut() {
    if (this.removeAttachmentForm.controls['comment'].value && this.removeAttachmentForm.controls['comment'].value.length > 0) {
      this.enableSubmit = false;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
