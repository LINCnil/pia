import { Component, OnInit, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { StructureModel } from '@api/models';
import { StructureApi } from '@api/services';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PermissionsService } from '@security/permissions.service';

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.scss']
})
export class StructureComponent implements OnInit {

  @Input() structure: StructureModel;
  editor: any;
  elementId: string;

  @ViewChild('structureForm') structureForm: NgForm;

  constructor(
    private route: ActivatedRoute,
    private structureApi: StructureApi,
    private permissionsService: PermissionsService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.structure = this.route.snapshot.data.structure;
  }

  /**
   * Update structure model
   */
  updateStructure() {
    this.structureApi.update(this.structure).subscribe(() => {});
  }

    /**
   * Check permissions and open editor to edit field content
   *
   * @param {any} element
   * @param {string[]} knowledgeBaseItemIdentifier
   * @memberof ProcessingFormComponent
   */
  editField(element: any) {
    this.permissionsService.hasPermission('CanEditStructure').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.elementId = element.id;
        this.loadEditor(element);
      }
    });
  }

    /**
   * Check permissions and open editor to edit field content
   *
   * @param {any} element
   * @param {string[]} knowledgeBaseItemIdentifier
   * @memberof ProcessingFormComponent
   */
  editDateField(element: any) {
    this.permissionsService.hasPermission('CanEditStructure').then((hasPerm: boolean) => {
      if (hasPerm) {
        this.elementId = element.id;
      }
    });
  }

  closeDateField(element: any) {
    this.structureForm.form.controls[element.name].patchValue(element.value);
    this.elementId = null;
    this.updateStructure();

    this.ref.detectChanges();
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

          this.structureForm.form.controls[element.name].patchValue(content);

          this.closeEditor();
          this.updateStructure();
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
