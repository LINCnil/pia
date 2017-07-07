import { Component, ElementRef, OnInit } from '@angular/core';
/*import {CommentItem} from './comment-item/comment-item.model';*/

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  nbComments = 5;
  constructor(private el: ElementRef) { }

  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  displayNewCommentBox() {
    const dropdown = this.el.nativeElement.querySelector('.pia-commentsBlock-new');
    dropdown.classList.toggle('open');
  }

  /**
   * Generates a new comment which is added in the comments list.
   */
  newCommentFocusOut() {
    // Generation of a new comment item component with value from new comment field.
    /*new CommentItem(null, 'test');*/
  }

  /**
   * Shows or hides the comments list.
   */
  displayCommentsList() {
    const typingArea = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    btn.classList.toggle('pia-icon-accordeon-down');
    typingArea.classList.toggle('close');
  }


  ngOnInit() {
  }

}
