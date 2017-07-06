import { Component, ElementRef, OnInit } from '@angular/core';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  nbComments = 5;
  constructor(private el: ElementRef) { }

  generateNewComment() {
    const dropdown = this.el.nativeElement.querySelector('.pia-commentsBlock-new');
    dropdown.classList.toggle('open');
  }

  displayCommentsList() {
    const typingArea = this.el.nativeElement.querySelector('.pia-commentsBlock-list');
    const btn = this.el.nativeElement.querySelector('.pia-commentsBlock-btn button span');
    btn.classList.toggle('pia-icon-accordeon-down');
    typingArea.classList.toggle('close');
  }


  ngOnInit() {
  }

}
