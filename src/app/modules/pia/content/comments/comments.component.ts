import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Comment } from '../../../../models/comment.model';

import { LanguagesService } from 'src/app/services/languages.service';
import { DialogService } from 'src/app/services/dialog.service';
import { CommentsService } from 'src/app/services/comments.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  commentsForm: UntypedFormGroup;
  comments: any;
  @Input() editMode:
    | 'local'
    | Array<'author' | 'evaluator' | 'validator' | 'guest'> = 'local';
  @Input() question: any;
  @Input() measure: any;
  @Input() questionId: any;
  @Input() measureId: any;
  @Input() pia: any;
  @Input() answer: any;
  questionDate: Date;
  newCommentDisplayer: boolean;
  displayCommentValidateBtn: boolean;

  constructor(
    private el: ElementRef,
    public languagesService: LanguagesService,
    private dialogService: DialogService,
    private commentsService: CommentsService
  ) {}

  ngOnInit(): void {
    if (
      this.answer.updated_at &&
      this.answer.updated_at.toString() !== 'Invalid Date'
    ) {
      this.questionDate = this.answer.updated_at;
    } else if (
      this.answer.created_at &&
      this.answer.created_at.toString() !== 'Invalid Date'
    ) {
      this.questionDate = this.answer.created_at;
    }
    this.comments = [];

    this.commentsService
      .findAllByReference(
        this.pia.id,
        this.measure ? this.measure.id : this.question.id
      )
      .then(entries => {
        this.comments = entries;
        this.comments.reverse();
      });

    this.commentsForm = new UntypedFormGroup({
      description: new UntypedFormControl()
    });
  }

  /**
   * Shows or hide the block which allows users to create a new comment.
   */
  toggleNewCommentBox(): void {
    const newCommentBox = this.el.nativeElement.querySelector(
      '.pia-commentsBlock-new'
    );
    // Opens comments list if it's closed.
    const accordionButton = this.el.nativeElement.querySelector(
      '.pia-commentsBlock-btn button span'
    );
    const commentsList = this.el.nativeElement.querySelector(
      '.pia-commentsBlock-list'
    );
    if (commentsList && accordionButton) {
      if (
        commentsList.classList.contains('close') &&
        accordionButton.classList.contains('pia-icon-accordion-down')
      ) {
        accordionButton.classList.toggle('pia-icon-accordion-up');
        accordionButton.classList.remove('pia-icon-accordion-down');
      }
      commentsList.classList.remove('close');
    }
    newCommentBox.classList.toggle('open');
    this.displayCommentValidateBtn = !this.displayCommentValidateBtn;
  }

  /**
   * Display the comment field.
   */
  newCommentOnChange(event): void {
    // Checks if the comment value exists.
    if (event && event.length > 0) {
      this.newCommentDisplayer = true;
    } else {
      this.newCommentDisplayer = false;
    }
  }

  /**
   * Create a new comment.
   */
  newCommentClickBtn(): void {
    // Checks if the comment value exists.
    if (
      this.commentsForm.value.description &&
      this.commentsForm.value.description.length > 0
    ) {
      // Checks if there are already comments and if so, checks if the last comment value is different from our current comment.

      // add Btn status
      if (
        this.comments.length > 0 &&
        this.comments[0].description === this.commentsForm.value.description
      ) {
        this.dialogService.confirmThis(
          {
            text: 'modals.same_comment.content',
            type: 'yes',
            yes: 'modals.close',
            no: '',
            icon: 'pia-icons pia-icon-sorry',
            data: {
              btn_yes: 'btn-blue'
            }
          },
          () => {
            return false;
          },
          () => {
            return false;
          }
        );
      } else {
        // Creates the new comment and pushes it as the first comment in list.
        // Updates accordion and counter + removes the written comment.
        const commentRecord = new Comment();
        commentRecord.for_measure = false;
        commentRecord.description = this.commentsForm.value.description;
        commentRecord.pia_id = this.pia.id;
        if (this.measure) {
          commentRecord.for_measure = true;
          commentRecord.reference_to = this.measure.id;
        } else {
          commentRecord.reference_to = this.question.id;
        }
        this.commentsService.create(commentRecord).then((id: number) => {
          commentRecord.id = id;
          this.comments.unshift(commentRecord);
          this.commentsForm.controls['description'].setValue('');
          this.getCommentsAccordionStatus();
          this.newCommentDisplayer = false;
        });
      }
    }
  }

  /**
   * Display comments list.
   */
  displayCommentsList(): void {
    const commentsList = this.el.nativeElement.querySelector(
      '.pia-commentsBlock-list'
    );
    const btn = this.el.nativeElement.querySelector(
      '.pia-commentsBlock-btn button span'
    );
    btn.classList.toggle('pia-icon-accordion-down');
    btn.classList.toggle('pia-icon-accordion-up');
    commentsList.classList.toggle('close');
  }

  /**
   * Returns a status about the comments number.
   * @returns - True if there are comments, False otherwise.
   */
  getCommentsAccordionStatus(): boolean {
    return this.comments.length > 0 ? true : false;
  }
}
