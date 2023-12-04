import {
  Component,
  Input,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { GlobalEvaluationService } from 'src/app/services/global-evaluation.service';
import { StructureService } from 'src/app/services/structure.service';
import { SidStatusService } from 'src/app/services/sid-status.service';
import { Structure } from 'src/app/models/structure.model';
import { KnowledgeBaseService } from 'src/app/services/knowledge-base.service';
import { DialogService } from 'src/app/services/dialog.service';
import { AnswerStructureService } from 'src/app/services/answer-structure.service';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit, OnDestroy {
  @Input() id: number;
  @Input() measure: any;
  @Input() item: any;
  @Input() section: any;
  @Input() structure: Structure;
  editor: any;
  elementId: string;
  displayDeleteButton = true;
  measureForm: UntypedFormGroup;
  editTitle = true;

  constructor(
    public globalEvaluationService: GlobalEvaluationService,
    public structureService: StructureService,
    private el: ElementRef,
    private knowledgeBaseService: KnowledgeBaseService,
    private ngZone: NgZone,
    private sidStatusService: SidStatusService,
    private dialogService: DialogService,
    private answerStructureService: AnswerStructureService
  ) {}

  ngOnInit(): void {
    this.measureForm = new UntypedFormGroup({
      measureTitle: new UntypedFormControl(),
      measureContent: new UntypedFormControl()
    });

    if (this.measure.title && this.measure.title.length > 0) {
      this.measureForm.controls['measureTitle'].patchValue(this.measure.title);
      this.measureForm.controls['measureTitle'].disable();
      this.editTitle = false;
    }

    if (this.measure.content && this.measure.content.length > 0) {
      this.measureForm.controls['measureContent'].patchValue(
        this.measure.content
      );
    }

    this.elementId = 'pia-measure-content-' + this.id;
  }

  ngOnDestroy(): void {
    tinymce.remove(this.editor);
  }

  /**
   * Enable auto resizing on measure title textarea.
   * @param {*} event - Any Event.
   * @param {HTMLElement} textarea - Any textarea.
   */
  autoTextareaResize(event: any, textarea?: HTMLElement): void {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height =
          textarea.scrollHeight * 2 - textarea.clientHeight + 'px';
      }
    }
  }

  /**
   * Enables edition for measure title.
   */
  measureTitleFocusIn(): void {
    if (this.structure.is_example) {
      return;
    }
    this.editTitle = true;
    this.measureForm.controls['measureTitle'].enable();

    const measureTitleTextarea = document.getElementById(
      'pia-measure-title-' + this.id
    );
    setTimeout(() => {
      measureTitleTextarea.focus();
    }, 200);
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param {event} event - Any Event.
   */
  measureTitleFocusOut(event: Event): void {
    let userText = this.measureForm.controls['measureTitle'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
      this.editTitle = false;
    }

    this.measure.title = userText;
    this.structureService.updateMeasureJson(
      this.section,
      this.item,
      this.measure,
      this.id,
      this.structure
    );

    if (
      this.measureForm.value.measureTitle &&
      this.measureForm.value.measureTitle.length > 0
    ) {
      this.measureForm.controls['measureTitle'].disable();
    }
    this.ngZone.run(() => {
      this.sidStatusService.setStructureStatus(this.section, this.item);
    });
  }

  /**
   * Loads WYSIWYG editor for measure answer.
   */
  measureContentFocusIn(): void {
    if (this.structure.is_example) {
      return;
    }
    this.loadEditor();
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   */
  measureContentFocusOut(): void {
    this.knowledgeBaseService.placeholder = null;
    this.editor = null;
    let userText = this.measureForm.controls['measureContent'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    this.ngZone.run(() => {
      this.measure.content = userText;
      this.structureService.updateMeasureJson(
        this.section,
        this.item,
        this.measure,
        this.id,
        this.structure
      );
      this.sidStatusService.setStructureStatus(this.section, this.item);
    });
  }

  /**
   * Shows or hides a measure.
   * @param {*} event - Any Event.
   */
  displayMeasure(event: any): void {
    const accordion = this.el.nativeElement.querySelector(
      '.pia-measureBlock-title button'
    );
    accordion.classList.toggle('pia-icon-accordion-down');
    const displayer = this.el.nativeElement.querySelector(
      '.pia-measureBlock-displayer'
    );
    displayer.classList.toggle('close');
  }

  /**
   * Allows an user to remove a measure.
   */
  removeMeasure(): void {
    this.dialogService.confirmThis(
      {
        text: 'modals.remove_measure.content',
        type: 'confirm',
        yes: 'modals.remove_measure.remove',
        no: 'modals.remove_measure.keep',
        icon: 'pia-icons pia-icon-sad',
        data: {
          btn_yes: 'btn-red'
        }
      },
      () => {
        this.answerStructureService.removeMeasure(
          this.structure,
          this.section.id,
          this.item.id,
          this.id
        );
      },
      () => {
        return;
      }
    );
  }

  /**
   * Loads wysiwyg editor.
   */
  loadEditor(): void {
    // this.knowledgeBaseService.placeholder = this.measure.placeholder;
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
          this.measureForm.controls['measureContent'].patchValue(
            editor.getContent()
          );
          this.measureContentFocusOut();
          tinymce.remove(this.editor);
        });
      }
    });
  }
}
