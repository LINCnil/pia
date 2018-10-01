import { Component, OnInit, AfterViewChecked, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Processing } from '@api/model';
import { ProcessingApi } from '@api/services';
import { ProcessingEvaluationStates, ProcessingStatus } from '@api/model/processing.model';

@Component({
  selector: 'app-evaluation-block',
  templateUrl: './evaluation-block.component.html',
  styleUrls: ['./evaluation-block.component.scss']
})
export class EvaluationBlockComponent implements OnInit, AfterViewChecked {
  processingEvaluationStates = ProcessingEvaluationStates;
  processingStatus = ProcessingStatus;
  editor: any = null;
  @Input() processing: Processing;
  @Output('processingUpdated') processingUpdated = new EventEmitter<Processing>();
  @ViewChild('evaluationComment') textarea: ElementRef;

  constructor(
    private processingApi: ProcessingApi,
  ) { }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.loadEditor();
  }

  public updateEvaluation() {
    this.processingApi.update(this.processing).subscribe((processing) => {
      this.processing = processing;
      this.processingUpdated.emit(this.processing);
    });
  }

  public evaluate(state: number) {
    this.processing.evaluation_state = state;

    if (state === this.processingEvaluationStates.EVALUATION_STATE_TO_CORRECT) {
      this.processing.evaluation_state = this.processingEvaluationStates.EVALUATION_STATE_NONE;
      this.processingApi.update(this.processing).subscribe((processing) => {
        this.processing.evaluation_state = this.processingEvaluationStates.EVALUATION_STATE_TO_CORRECT;
        this.updateProcessing();
      });
    } else {
      this.updateProcessing();
    }
  }

  /**
   * Load wysiwyg editor.
   *
   * @private
   * @memberof ProcessingFormComponent
   */
  private loadEditor() {
    const element = this.textarea !== undefined ? this.textarea.nativeElement : null;

    if (element === null) {

      if (this.editor !== null) {
        tinymce.remove(this.editor);
        this.editor = null;
      }

      return;
    }

    if (this.editor === null) {
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
        init_instance_callback:(editor) => {
          editor.setContent(this.processing.evaluation_comment);  
        },
        setup: editor => {
          this.editor = editor;
          editor.on('focusout', () => {
            const content = editor.getContent();

            if (this.processing.evaluation_comment !== content) {
              this.processing.evaluation_comment = content;

              this.updateEvaluation();
            }
          });
        }
      });
    }
  }

  private updateProcessing() {
    this.processingApi.update(this.processing).subscribe((processing) => {
      this.processing = processing;
      this.processingUpdated.emit(this.processing);
    });
  }

  public cancelProcessingValidation() {
    this.processing.evaluation_state = this.processingEvaluationStates.EVALUATION_STATE_NONE;
    this.processing.status = this.processingStatus.STATUS_UNDER_VALIDATION;

    this.updateProcessing();
  }
}
