import { Component, Input, ElementRef, Renderer2, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { ModalsService } from 'app/modals/modals.service';
import { KnowledgeBaseService } from 'app/entry/knowledge-base/knowledge-base.service';
import { GlobalEvaluationService } from 'app/services/global-evaluation.service';
import { StructureService } from 'app/services/structure.service';
import { SidStatusService } from 'app/services/sid-status.service';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss'],
  providers: [StructureService]
})
export class MeasuresComponent implements OnInit, OnDestroy {

  @Input() id: number;
  @Input() measure: any;
  @Input() item: any;
  @Input() section: any;
  editor: any;
  elementId: string;
  displayDeleteButton = true;
  measureForm: FormGroup;
  editTitle = true;

  constructor(
    public _globalEvaluationService: GlobalEvaluationService,
    public _structureService: StructureService,
    private el: ElementRef,
    private _modalsService: ModalsService,
    private _knowledgeBaseService: KnowledgeBaseService,
    private _ngZone: NgZone,
    private _sidStatusService: SidStatusService) { }

  ngOnInit() {
    this.measureForm = new FormGroup({
      measureTitle: new FormControl(),
      measureContent: new FormControl()
    });

    if (this.measure.title && this.measure.title.length > 0) {
      this.measureForm.controls['measureTitle'].patchValue(this.measure.title);
      this.measureForm.controls['measureTitle'].disable();
      this.editTitle = false;
    }

    if (this.measure.content && this.measure.content.length > 0) {
      this.measureForm.controls['measureContent'].patchValue(this.measure.content);
    }

    this.elementId = 'pia-measure-content-' + this.id;
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  /**
   * Enable auto resizing on measure title textarea.
   * @param {*} event - Any Event.
   * @param {HTMLElement} textarea - Any textarea.
   * @memberof MeasuresComponent
   */
  autoTextareaResize(event: any, textarea?: HTMLElement) {
    if (event) {
      textarea = event.target;
    }
    if (textarea.clientHeight < textarea.scrollHeight) {
      textarea.style.height = textarea.scrollHeight + 'px';
      if (textarea.clientHeight < textarea.scrollHeight) {
        textarea.style.height = (textarea.scrollHeight * 2 - textarea.clientHeight) + 'px';
      }
    }
  }

  /**
   * Enables edition for measure title.
   * @memberof MeasuresComponent
   */
  measureTitleFocusIn() {
    if (this._structureService.structure.is_example) {
      return;
    }
    this.editTitle = true;
    this.measureForm.controls['measureTitle'].enable();

    const measureTitleTextarea = document.getElementById('pia-measure-title-' + this.id);
    setTimeout(() => {
      measureTitleTextarea.focus();
    }, 200);
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param {event} event - Any Event.
   * @memberof MeasuresComponent
   */
  measureTitleFocusOut(event: Event) {
    let userText = this.measureForm.controls['measureTitle'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
      this.editTitle = false;
    }

    this.measure.title = userText;
    this._structureService.updateMeasureJson(this.section, this.item, this.measure, this.id);

    if (this.measureForm.value.measureTitle && this.measureForm.value.measureTitle.length > 0) {
      this.measureForm.controls['measureTitle'].disable();
    }
    this._ngZone.run(() => {
      this._sidStatusService.setStructureStatus(this.section, this.item);
    });

  }

  /**
   * Loads WYSIWYG editor for measure answer.
   * @memberof MeasuresComponent
   */
  measureContentFocusIn() {
    if (this._structureService.structure.is_example) {
      return;
    }
    this.loadEditor();
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   * @memberof MeasuresComponent
   */
  measureContentFocusOut() {
    this._knowledgeBaseService.placeholder = null;
    this.editor = null;
    let userText = this.measureForm.controls['measureContent'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    this._ngZone.run(() => {
      this.measure.content = userText;
      this._structureService.updateMeasureJson(this.section, this.item, this.measure, this.id);
      this._sidStatusService.setStructureStatus(this.section, this.item);
    });
  }

  /**
   * Shows or hides a measure.
   * @param {*} event - Any Event.
   * @memberof MeasuresComponent
   */
  displayMeasure(event: any) {
    const accordeon = this.el.nativeElement.querySelector('.pia-measureBlock-title button');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-measureBlock-displayer');
    displayer.classList.toggle('close');
  }

  /**
   * Allows an user to remove a measure.
   * @memberof MeasuresComponent
   */
  removeMeasure() {
    localStorage.setItem('measure-id', [this.section.id, this.item.id, this.id].toString());
    this._modalsService.openModal('remove-structure-measure');
  }

  /**
   * Loads wysiwyg editor.
   * @memberof MeasuresComponent
   */
  loadEditor() {
    // this._knowledgeBaseService.placeholder = this.measure.placeholder;
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
          this.measureForm.controls['measureContent'].patchValue(editor.getContent());
          this.measureContentFocusOut();
          tinymce.remove(this.editor);
        });
      },
    });
  }
}
