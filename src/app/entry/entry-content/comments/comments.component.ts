import { Component, ElementRef, OnInit } from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {Comment} from './comments.model';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  nbComments = 5;
  commentForm: FormGroup;
  comments: Comment[] = [];
  constructor(private el: ElementRef) { }

  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  displayNewCommentBox() {
    const dropdown = this.el.nativeElement.querySelector('.pia-commentsBlock-new');
    dropdown.classList.toggle('open');
  }
  newCommentFocusOut() {
    // Generation of a new comment item component with value from new comment field
    const commentRecord = new Comment(null, this.commentForm.value.description);
    this.comments.unshift(commentRecord);
    console.log(this.comments)
  }
  displayCommentsList() {
    const typingArea = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    btn.classList.toggle('pia-icon-accordeon-down');
    typingArea.classList.toggle('close');
  }
  ngOnInit() {
    this.commentForm = new FormGroup({
      'description': new FormControl()
    });
  }
}
