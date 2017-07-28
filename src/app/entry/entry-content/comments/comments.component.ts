import { Component, ElementRef, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalsComponent } from '../../../modals/modals.component';
import { Router } from '@angular/router';
import { Comment } from './comment.model';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  modal = new ModalsComponent(this.router);
  commentsForm: FormGroup;
  comments: any;
  @Input() question: any;
  @Input() measure: any;
  @Input() pia: any;

  constructor(private el: ElementRef, private router: Router) {
    this.router = router;
  }

  ngOnInit() {
    this.comments = [];
    /*
      TODO : load in 'this.comments' the adequate comments for each specific question/measure.
      Think to do this in the promise : this.nbComments = this.comments.length;
    */
    const commentsModel = new Comment();

    if (this.measure) {
      /* TODO : select * from comments where comment.pia_id = this.pia.id && comment.for_measure = true && reference_to = this.measure.id */
    } else {
      /* TODO : select * from comments where comment.pia_id = this.pia.id && reference_to = this.question.id */
    }

    // Just for now 'till we code the above TODO...
    commentsModel.findAll().then((entries) => {
      /*
        TODO : les mettre dans l'ordre inversé : du dernier au premier
        (dans la logique de l'outil où les derniers commentaires sont en haut/en premier)
      */
      this.comments = entries;
    });

    this.commentsForm = new FormGroup({
      description: new FormControl()
    });
  }


  /**
   * Shows or hides the block which allows users to create a new comment.
   */
  toggleNewCommentBox() {
    const newCommentBox = this.el.nativeElement.querySelector('.pia-commentsBlock-new');;
    // Opens comments list if it's closed.
    const accordeonButton = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    if (commentsList.classList.contains('close') && accordeonButton.classList.contains('pia-icon-accordeon-down')) {
      accordeonButton.classList.toggle('pia-icon-accordeon-up');
      accordeonButton.classList.remove('pia-icon-accordeon-down');
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
        const commentRecord = new Comment();
        commentRecord.description = this.commentsForm.value.description;
        commentRecord.pia_id = this.pia.id;
        if (this.measure) {
          commentRecord.for_measure = true;
          commentRecord.reference_to = this.measure.id ;
        } else {
          commentRecord.reference_to = this.question.id;
        }
        commentRecord.create().then((id: number) => {
          commentRecord.id = id;
          this.comments.unshift(commentRecord);
          this.commentsForm.controls['description'].setValue('');
          this.toggleNewCommentBox();
          // this.updateCommentsCounter();
          this.getCommentsAccordeonStatus();
        });
      }
    }
  }

  /**
   * Display comments list.
   */
  displayCommentsList() {
    const commentsList = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    btn.classList.toggle('pia-icon-accordeon-down');
    btn.classList.toggle('pia-icon-accordeon-up');
    commentsList.classList.toggle('close');
  }

  /**
   * Returns a status about the comments number.
   * @returns {Boolean} true if there are comments, false otherwise.
   */
  getCommentsAccordeonStatus() {
    return this.comments.length > 0 ? true : false;
  }

}
