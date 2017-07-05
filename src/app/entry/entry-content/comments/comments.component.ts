import { Component, ElementRef, OnInit } from '@angular/core';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  constructor(private el: ElementRef) { }

  commentsOpenCloseType() {
    const dropdown = this.el.nativeElement.querySelector('.pia-CommentsType');
    dropdown.classList.toggle('open');
  }
  commentsOpenCloseList() {
    const typingArea = this.el.nativeElement.querySelector('.pia-CommentsList');
    typingArea.classList.toggle('close');
  }


  ngOnInit() {
  }

}
