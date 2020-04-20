import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { KnowledgeBase } from 'src/app/models/knowledgeBase.model';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {
  base: KnowledgeBase = null;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    let sectionId = parseInt(this.route.snapshot.params.id, 10);
    this.base = new KnowledgeBase();
    this.base
      .get(sectionId)
      .then(() => {})
      .catch(() => {});
  }
}
