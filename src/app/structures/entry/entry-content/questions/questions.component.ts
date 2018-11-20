import { Component, Input, ElementRef, OnInit, Renderer2, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { ModalsService } from 'app/modals/modals.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { StructureService } from 'app/services/structure.service';
import { SidStatusService } from 'app/services/sid-status.service';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
  providers: [StructureService]
})

export class QuestionsComponent implements OnInit, OnDestroy {
  userMeasures = [];
  @Input() question: any;
  @Input() item: any;
  @Input() section: any;
  questionForm: FormGroup;
  lastSelectedTag: string;
  elementId: String;
  editor: any;
  editTitle = true;

  constructor(private el: ElementRef,
              private _knowledgeBaseService: KnowledgeBaseService,
              private _modalsService: ModalsService,
              private _ngZone: NgZone,
              public _globalEvaluationService: GlobalEvaluationService,
              private renderer: Renderer2,
              private _sidStatusService: SidStatusService,
              private _structureService: StructureService) { }

  ngOnInit() {
    this._globalEvaluationService.answerEditionEnabled = true;
    this.elementId = 'pia-question-content-' + this.question.id;
    this.questionForm = new FormGroup({
      title: new FormControl(),
      gauge: new FormControl(0),
      text: new FormControl(),
      list: new FormControl()
    });

    if (this.question.title && !this.question.title.startsWith('section') && this.question.title.length > 0) {
      this.questionForm.controls['title'].patchValue(this.question.title);
      this.questionForm.controls['title'].disable();
      this.editTitle = false;
    }

    this.questionForm.controls['text'].patchValue(this.question.answer);
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  removeQuestion() {
    localStorage.setItem('question-id', [this.section.id, this.item.id, this.question.id].toString());
    this._modalsService.openModal('remove-question');
  }

  /**
   * Enables edition for question title.
   * @memberof QuestionsComponent
   */
  questionTitleFocusIn() {
    if (this._structureService.structure.is_example) {
      return;
    }
    this.editTitle = true;
    this.questionForm.controls['title'].enable();
    const questionTitleTextarea = document.getElementById('pia-questionBlock-title-' + this.question.id);
    setTimeout(() => {
      questionTitleTextarea.focus();
    }, 200);
  }

  /**
   * Disables title field when losing focus from it.
   * Shows question edit button.
   * Saves data from title field.
   * @param {event} event - Any Event.
   * @memberof QuestionsComponent
   */
  questionTitleFocusOut(event: Event) {
    let userText = this.questionForm.controls['title'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
      this.editTitle = false;
    }

    if (userText && userText.length >= 1) {
      this.question.title = userText;
      this._structureService.updateJson(this.section, this.item, this.question);
    }

    if (this.questionForm.value.title && this.questionForm.value.title.length > 0) {
      this.questionForm.controls['title'].disable();
    }
  }

  /**
   * Loads WYSIWYG editor.
   * @memberof QuestionsComponent
   */
  questionContentFocusIn() {
    if (this._structureService.structure.is_example) {
      return;
    }
    const questionTitleTextarea = document.getElementById('pia-questionBlock-title-' + this.question.id);
    const questionTitle = this.questionForm.controls['title'].value;
    if (questionTitleTextarea && !questionTitle) {
        questionTitleTextarea.classList.add('pia-required');
        questionTitleTextarea.focus();
    } else if (this._globalEvaluationService.answerEditionEnabled) {
      this.loadEditor();
    }
  }

  /**
   * Disables question field + shows edit button + save data.
   * @memberof QuestionsComponent
   */
  questionContentFocusOut() {
    let userText = this.questionForm.controls['text'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    this._ngZone.run(() => {
      this.question.answer = userText;
      this._structureService.updateJson(this.section, this.item, this.question);
      this._sidStatusService.setStructureStatus(this.section, this.item);
    });
  }

  /**
   * Shows or hides a question.
   * @param {*} event - Any Event.
   * @memberof QuestionsComponent
   */
  displayQuestion(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-accordeon');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-questionBlock-displayer');
    displayer.classList.toggle('close');
  }

  /**
   * Loads wysiwyg editor.
   * @memberof QuestionsComponent
   */
  loadEditor() {
    this._knowledgeBaseService.placeholder = this.question.placeholder;
    this._knowledgeBaseService.search('', '', this.question.link_knowledge_base);
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block : false,
      autoresize_bottom_margin: 30,
      auto_focus: this.elementId,
      autoresize_min_height: 40,
      content_style: 'body {background-color:#eee!important;}' ,
      selector: '#' + this.elementId,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;
        editor.on('focusout', () => {
          this.questionForm.controls['text'].patchValue(editor.getContent());
          this.questionContentFocusOut();
          this.closeEditor();
        });
      },
    });
  }

  /**
   * Close the editor.
   * @private
   * @memberof QuestionsComponent
   */
  private closeEditor() {
    this._knowledgeBaseService.placeholder = null;
    tinymce.remove(this.editor);
    this.editor = null;
  }
}
