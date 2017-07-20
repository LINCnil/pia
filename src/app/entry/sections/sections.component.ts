import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Card } from '../../cards/card.model';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class SectionsComponent implements OnInit {

  pia_id: number;
  pia_name: string;

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.pia_id = parseInt(params['id']);
      const card = new Card();
      card.find(this.pia_id).then((entry: any) => {
        this.pia_name = entry.name;
      });
    });
  }
}
