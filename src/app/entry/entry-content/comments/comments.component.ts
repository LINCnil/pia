import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { CommentModel } from '@api/models';
import { CommentApi } from '@api/services';

import { MeasureService } from 'app/entry/entry-content/measures/measures.service';
import { ModalsService } from 'app/modals/modals.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  commentsForm: FormGroup;
  comments: any;
  @Input() question: any;
  @Input() measure: any;
  @Input() questionId: any;
  @Input() measureId: any;
  @Input() pia: any;
  @Input() answer: any;
  questionDate: Date;
  newCommentDisplayer: boolean;
  displayCommentValidateBtn: boolean;

  constructor(private el: ElementRef,
    private _measureService: MeasureService,
    private _modalsService: ModalsService,
    private commentApi: CommentApi
  ) { }

  ngOnInit() {
    if (this.answer.updated_at && this.answer.updated_at.toString() !== 'Invalid Date') {
      this.questionDate = this.answer.updated_at;
    } else if (this.answer.created_at && this.answer.created_at.toString() !== 'Invalid Date') {
      this.questionDate = this.answer.created_at;
    }
    this.comments = [];
    const ref_to = this.measure ? this.measure.id : this.question.id;

    this.commentApi.getAllByRef(this.pia.id, ref_to).subscribe((entries: CommentModel[]) => {
      this.comments = entries;
      this.comments.reverse();
    });

    this.commentsForm = new FormGroup({
      description: new FormControl()
    });
  }

  /**
   * Shows or hide the block which allows users to create a new comment.
   * @memberof CommentsComponent
   */
  toggleNewCommentBox() {
    const newCommentBox = this.el.nativeElement.querySelector('.pia-commentsBlock-new');
    // Opens comments list if it's closed.
    const accordeonButton = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    if (commentsList && accordeonButton) {
      
        accordeonButton.classList.toggle('fa-angle-up');
        accordeonButton.classList.toggle('fa-angle-down');
      
      commentsList.classList.remove('close');
    }
    newCommentBox.classList.toggle('open');
    this.displayCommentValidateBtn = !this.displayCommentValidateBtn;
  }

  /**
   * Display the comment field.
   * @memberof CommentsComponent
   */
  newCommentOnChange(event) {
    // Checks if the comment value exists.
    if (event && event.length > 0) {
      this.newCommentDisplayer = true;
    } else {
      this.newCommentDisplayer = false;
    }
  }

  /**
   * Create a new comment.
   * @memberof CommentsComponent
   */
  newCommentClickBtn() {
    // Checks if the comment value exists.
    if (this.commentsForm.value.description && this.commentsForm.value.description.length > 0) {
      // Checks if there are already comments and if so, checks if the last comment value is different from our current comment.

      // add Btn status
      if (this.comments.length > 0 && this.comments[0].description === this.commentsForm.value.description) {
        this._modalsService.openModal('modal-same-comment');
      } else {
        // Creates the new comment and pushes it as the first comment in list.
        // Updates accordeon and counter + removes the written comment.
        const commentRecord = new CommentModel();
        commentRecord.for_measure = false;
        commentRecord.description = this.commentsForm.value.description;
        commentRecord.pia_id = this.pia.id;
        if (this.measure) {
          commentRecord.for_measure = true;
          commentRecord.reference_to = this.measure.id;
        } else {
          commentRecord.reference_to = this.question.id;
        }
        this.commentApi.create(commentRecord).subscribe((newComment: CommentModel) => {
          commentRecord.fromJson(newComment);
          this.comments.unshift(commentRecord);
          this.commentsForm.controls['description'].setValue('');
          this.getCommentsAccordeonStatus();
          this.newCommentDisplayer = false;
        });
      }
    }
  }

  /**
   * Display comments list.
   * @memberof CommentsComponent
   */
  displayCommentsList() {
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    
    btn.classList.toggle('fa-angle-up');
    btn.classList.toggle('fa-angle-down');
    commentsList.classList.toggle('close');
  }

  /**
   * Returns a status about the comments number.
   * @returns {Boolean} - True if there are comments, False otherwise.
   * @memberof CommentsComponent
   */
  getCommentsAccordeonStatus() {
    return this.comments.length > 0 ? true : false;
  }

}
