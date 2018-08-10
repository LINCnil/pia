import { Component, Input, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { KnowledgeBaseService } from '../../entry/knowledge-base/knowledge-base.service';
import { ProcessingModel } from '@api/models';
import { ProcessingApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';


@Component({
  selector: 'app-processing-form',
  templateUrl: './processing-form.component.html',
  styleUrls: ['./processing-form.component.scss']
})
export class ProcessingFormComponent implements OnDestroy {
  @Input() sections: any;
  @Input() processing: ProcessingModel;
  @Input() currentSection: any;
  @ViewChild('processingForm') processingForm: NgForm;
  editor: any;
  elementId: String;

  constructor(
    private processingApi: ProcessingApi,
    private ref: ChangeDetectorRef,
    private permissionsService: PermissionsService,
    private knowledgeBaseService: KnowledgeBaseService
  ) {
    this.knowledgeBaseService.knowledgeBaseData = [];
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
  updateProcessing(dataTypes: boolean = false ) {
    if (dataTypes) {
      return
    };

    this.processingApi.update(this.processing).subscribe(() => {});
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
      },
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
    this.editor = null;
  }
}
