import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ProcessingModel, ProcessingCommentModel } from '@api/models';
import { ProcessingCommentApi } from '@api/services';

@Component({
  selector: 'app-processing-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  @Input() processing: ProcessingModel;
  @Input() field: string;
  commentForm: FormGroup;
  comments: ProcessingCommentModel[];
  displayInput: boolean = false;
  displayList: boolean = false;

  constructor(private processingCommentApi: ProcessingCommentApi) {
  }

  ngOnInit() {
    this.commentForm = new FormGroup({
      content: new FormControl()
    });

    this.filterComments();
  }

  /**
   * Show or hide the block which allows users to create a new comment.
   * @memberof CommentsComponent
   */
  toggleCommentInput() {
    if (this.processing.comments.length) {
      this.toggleCommentsList();
    }

    this.displayInput = !this.displayInput;
  }

  /**
   * Show or hide comments list.
   * @memberof CommentsComponent
   */
  toggleCommentsList() {
   this.displayList = !this.displayList;
  }

  /**
   * Handle comment form submission
   * @memberof CommentsComponent
   */
  newComment() {
    const comment = new ProcessingCommentModel();
console.log(this.commentForm);
    comment.processing_id = this.processing.id;
    comment.content = this.commentForm.value.content;
    comment.field = this.field;

    this.processingCommentApi.create(comment).subscribe((newComment: ProcessingCommentModel) => {
      comment.fromJson(newComment);
      this.processing.comments.unshift(comment);
      this.filterComments();
      this.commentForm.controls['content'].setValue('');
    });
  }

  filterComments() {
    this.comments = this.processing.comments.filter(comment => comment.field === this.field);
  }

}
