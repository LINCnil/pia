import {Component, ElementRef, OnInit} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import { ModalsComponent } from '../../../modals/modals.component';
import {Comment} from './comments.model';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  modal = new ModalsComponent();
  nbComments: number;
  commentsForm: FormGroup;
  comments: Comment[] = [];

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.nbComments = this.comments.length;
    this.commentsForm = new FormGroup({
      description: new FormControl()
    });
  }


  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  toggleNewCommentBox() {
    const newCommentBox = this.el.nativeElement.querySelector('.pia-commentsBlock-new');

    // Opens comments list if it's closed.
    const accordeonButton = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    if (commentsList.classList.contains('close')) {
      accordeonButton.classList.toggle('pia-icon-accordeon-down');
    }
    commentsList.classList.remove('close');
    newCommentBox.classList.toggle('open');
  }

  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  newCommentFocusOut() {
    // Checks if the comment value exists.
    if (this.commentsForm.value.description && this.commentsForm.value.description.length > 0) {
      // Checks if there are already comments and if so, checks if the last comment value is different from our current comment.
      if (this.comments.length > 0 && this.comments[0].description === this.commentsForm.value.description) {
        this.modal.openModal('modal-same-comment');
      } else {
        // Creates the new comment and pushes it as the first comment in list.
        // Updates accordeon and counter + removes the written comment.
        const commentRecord = new Comment(null, this.commentsForm.value.description);
        this.comments.unshift(commentRecord);
        this.commentsForm.controls['description'].setValue('');
        this.toggleNewCommentBox();
        this.updateCommentsCounter();
        this.getCommentsAccordeonStatus();
      }
    }
  }

  /**
   * Updates comments counter with the total number of comments.
   */
  updateCommentsCounter() {
    const commentsNumber = this.comments.length;
    this.nbComments = commentsNumber;
  }

  /**
   * Display comments list.
   */
  displayCommentsList() {
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    btn.classList.toggle('pia-icon-accordeon-down');
    commentsList.classList.toggle('close');
  }

  /**
   * Returns a status about the comments number.
   * @returns {Boolean} true if there are comments, false otherwise.
   */
  getCommentsAccordeonStatus() {
    return this.nbComments > 0 ? true : false;
  }

}
