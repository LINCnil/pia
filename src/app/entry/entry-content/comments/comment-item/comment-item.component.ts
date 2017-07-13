import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.scss']
})
export class CommentItemComponent implements OnInit {

  @Input() comment: { id: number, description: string, reference_to: string, type: string };

  constructor() { }

  ngOnInit() {
  }

}
