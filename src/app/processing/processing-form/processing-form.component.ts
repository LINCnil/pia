import { Component, Input, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { KnowledgeBaseService } from '../../entry/knowledge-base/knowledge-base.service';
import { ProcessingModel } from '@api/models';
import { ProcessingApi, ProcessingDataTypeApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { ProcessingStatus, ProcessingEvaluationStates } from '@api/model/processing.model';


@Component({
  selector: 'app-processing-form',
  templateUrl: './processing-form.component.html',
  styleUrls: ['./processing-form.component.scss']
})
export class ProcessingFormComponent implements OnDestroy, OnInit {
  @Input() sections: any;
  @Input() processing: ProcessingModel;
  @Input() currentSection: any;
  @ViewChild('processingForm') processingForm: NgForm;
  editor: any;
  elementId: String;
  processingFullyFilled: boolean = false;
  processingStatus = ProcessingStatus;
  processingEvaluationStates = ProcessingEvaluationStates;

  constructor(
    private processingApi: ProcessingApi,
    private processingDataTypeApi: ProcessingDataTypeApi,
    private ref: ChangeDetectorRef,
    private permissionsService: PermissionsService,
    private knowledgeBaseService: KnowledgeBaseService
  ) {
    this.knowledgeBaseService.knowledgeBaseData = [];
  }

  ngOnInit(): void {
    this.isFullyFilled();
  }

  ngOnDestroy() {
    this.closeEditor();
  }

  /**
   * Update Processing model
   *
   * @param {boolean} dataTypes
   * @memberof ProcessingFormComponent
   */
  updateProcessing(dataTypes: boolean = false) {
    this.isFullyFilled();

    if (dataTypes) {
      return
    };

    this.processingApi.update(this.processing).subscribe(() => { });
  }

  updateKnowledgeBase(slugs: string[]) {
    const item = {
      link_knowledge_base: slugs
    };
    this.knowledgeBaseService.loadByItem(item);
  }

  /**
   * Check permissions and open editor to edit field content
   *
   * @param {any} element
   * @param {string[]} knowledgeBaseItemIdentifier
   * @memberof ProcessingFormComponent
   */
  editField(element: any, knowledgeBaseItemIdentifier?: string[]) {
    this.permissionsService.hasPermission('CanEditProcessing').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.elementId = element.id;

        this.loadEditor(element);
      }
      if (knowledgeBaseItemIdentifier) {
        this.updateKnowledgeBase(knowledgeBaseItemIdentifier);
      }

      this.isFullyFilled();
    });
  }

  /**
   * Load wysiwyg editor.
   *
   * @private
   * @param element
   * @memberof ProcessingFormComponent
   */
  private loadEditor(element: any) {
    tinymce.init({
      branding: false,
      menubar: false,
      statusbar: false,
      plugins: 'autoresize lists',
      forced_root_block: false,
      autoresize_bottom_margin: 30,
      auto_focus: element.id,
      autoresize_min_height: 40,
      content_style: 'body {background-color:#eee!important;}',
      selector: '#' + element.id,
      toolbar: 'undo redo bold italic alignleft aligncenter alignright bullist numlist outdent indent',
      skin_url: 'assets/skins/lightgray',
      setup: editor => {
        this.editor = editor;

        editor.on('focusout', () => {
          const content = editor.getContent();

          this.processingForm.form.controls[element.name].patchValue(content);

          this.closeEditor();
          this.updateProcessing();
          // Hack to trigger view update
          this.ref.detectChanges();
        });
      }
    });
  }

  /**
   * Close wysiwig editor
   *
   * @private
   * @memberof ProcessingFormComponent
   */
  private closeEditor() {
    tinymce.remove(this.editor);
    this.isFullyFilled();
    this.editor = null;
  }

  protected isFullyFilled(): void {
    const fields = [
      'description',
      'controllers',
      'standards',
      'storage',
      'life_cycle',
      'processors',
      'non_eu_transfer',
      'recipients',
      'lawfulness',
      'minimization',
      'rights_guarantee',
      'exctness',
      'consent'
    ];

    let isFullyFilled = true;

    this.processingDataTypeApi.getAll(this.processing.id).subscribe((processingDataTypes) => {
      isFullyFilled = processingDataTypes.length > 0;

      for (const field of fields) {
        if (
          this.processing.hasOwnProperty(field)
          && (
            this.processing[field] === null
            ||
            this.processing[field] === undefined
            ||
            this.processing[field] === ''
          )
        ) {
          isFullyFilled = false;
        }
      }

      this.processingFullyFilled = isFullyFilled;
    });
  }

  protected askValidation(): void {
    this.processing.status = ProcessingStatus.STATUS_UNDER_VALIDATION;

    this.processingApi.update(this.processing).subscribe((processing) => {
      this.processing = processing;
    });
  }

  protected cancelAskValidation(): void {
    this.processing.status = ProcessingStatus.STATUS_DOING;

    this.processingApi.update(this.processing).subscribe((processing) => {
      this.processing = processing;
    });
  }

  public onProcessngUpdated(processing: ProcessingModel) {
    this.processing = processing;
    this.ref.detectChanges();
  }
}
