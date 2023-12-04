import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  NgZone,
  Output,
  EventEmitter
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { StructureService } from 'src/app/services/structure.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { Structure } from 'src/app/models/structure.model';
import { DialogService } from 'src/app/services/dialog.service';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit, OnDestroy {
  userMeasures = [];
  @Input() structure: Structure;
  @Input() question: any;
  @Input() item: any;
  @Input() section: any;
  @Output() questionDeleted = new EventEmitter();
  questionForm: UntypedFormGroup;
  lastSelectedTag: string;
  elementId: string;
  editor: any;
  editTitle = true;

  constructor(
    private el: ElementRef,
    private knowledgeBaseService: KnowledgeBaseService,
    private ngZone: NgZone,
    public globalEvaluationService: GlobalEvaluationService,
    private sidStatusService: SidStatusService,
    private structureService: StructureService,
    private answerStructureService: AnswerStructureService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.globalEvaluationService.answerEditionEnabled = true;
    this.elementId = 'pia-question-content-' + this.question.id;
    this.questionForm = new UntypedFormGroup({
      title: new UntypedFormControl(),
      gauge: new UntypedFormControl(0),
      text: new UntypedFormControl(),
      list: new UntypedFormControl()
    });

    if (
      this.question.title &&
      !this.question.title.startsWith('section') &&
      this.question.title.length > 0
    ) {
      this.questionForm.controls['title'].patchValue(this.question.title);
      this.questionForm.controls['title'].disable();
      this.editTitle = false;
    }

    this.questionForm.controls['text'].patchValue(this.question.answer);
  }

  ngOnDestroy(): void {
    tinymce.remove(this.editor);
  }

  removeQuestion(): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.remove_question.content',
        type: 'confirm',
        yes: 'modals.remove_question.remove',
        no: 'modals.remove_question.keep',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.answerStructureService.removeQuestion(
          this.structure,
          this.section.id,
          this.item.id,
          this.question.id
        );
        this.questionDeleted.emit(this.question.id);
      },
      () => {
        return;
      }
    );
  }

  /**
   * Enables edition for question title.
   */
  questionTitleFocusIn(): void {
    if (this.structure.is_example) {
      return;
    }
    this.editTitle = true;
    this.questionForm.controls['title'].enable();
    const questionTitleTextarea = document.getElementById(
      'pia-questionBlock-title-' + this.question.id
    );
    setTimeout(() => {
      questionTitleTextarea.focus();
    }, 200);
  }

  /**
   * Disables title field when losing focus from it.
   * Shows question edit button.
   * Saves data from title field.
   * @param {event} event - Any Event.
   */
  questionTitleFocusOut(event: Event): void {
    let userText = this.questionForm.controls['title'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
      this.editTitle = false;
    }

    if (userText && userText.length >= 1) {
      this.question.title = userText;
      this.structureService.updateJson(
        this.section,
        this.item,
        this.question,
        this.structure
      );
    }

    if (
      this.questionForm.value.title &&
      this.questionForm.value.title.length > 0
    ) {
      this.questionForm.controls['title'].disable();
    }
  }

  /**
   * Loads WYSIWYG editor.
   */
  questionContentFocusIn(): void {
    if (this.structure.is_example) {
      return;
    }
    const questionTitleTextarea = document.getElementById(
      'pia-questionBlock-title-' + this.question.id
    );
    const questionTitle = this.questionForm.controls['title'].value;
    if (questionTitleTextarea && !questionTitle) {
      questionTitleTextarea.classList.add('pia-required');
      questionTitleTextarea.focus();
    } else if (this.globalEvaluationService.answerEditionEnabled) {
      this.loadEditor();
    }
  }

  /**
   * Disables question field + shows edit button + save data.
   */
  questionContentFocusOut(): void {
    let userText = this.questionForm.controls['text'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    this.ngZone.run(() => {
      this.question.answer = userText;
      this.structureService.updateJson(
        this.section,
        this.item,
        this.question,
        this.structure
      );
      this.sidStatusService.setStructureStatus(this.section, this.item);
    });
  }

  /**
   * Shows or hides a question.
   * @param {*} event - Any Event.
   */
  displayQuestion(event: any): void {
    const accordion = this.el.nativeElement.querySelector('.pia-accordion');
    accordion.classList.toggle('pia-icon-accordion-down');
    const displayer = this.el.nativeElement.querySelector(
      '.pia-questionBlock-displayer'
    );
    displayer.classList.toggle('close');
  }

  /**
   * Loads wysiwyg editor.
   */
  loadEditor(): void {
    this.knowledgeBaseService.placeholder = this.question.placeholder;
    this.knowledgeBaseService.search('', '', this.question.link_knowledge_base);
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block: false,
      autoresize_bottom_margin: 30,
      auto_focus: this.elementId,
      autoresize_min_height: 40,
      skin: false,
      selector: '#' + this.elementId,
      toolbar:
        'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          this.questionForm.controls['text'].patchValue(editor.getContent());
          this.questionContentFocusOut();
          this.closeEditor();
        });
      }
    });
  }

  /**
   * Close the editor.
   * @private
   */
  private closeEditor(): void {
    this.knowledgeBaseService.placeholder = null;
    tinymce.remove(this.editor);
    this.editor = null;
  }
}
