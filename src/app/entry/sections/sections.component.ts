import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { Card } from '../../cards/card.model';
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss']
})
export class SectionsComponent implements OnInit {

  pia_id: number;
  item_id: number;
  section_id: number;
  pia_name: string;
  data: any;

  constructor(private activatedRoute: ActivatedRoute, private http: Http) {
  }

  ngOnInit() {
    // Display the name of the current PIA
    this.activatedRoute.params.subscribe((params: Params) => {
      this.pia_id = parseInt(params['id']);
      this.item_id = parseInt(params['item_id']);
      this.section_id = parseInt(params['section_id']);
      const card = new Card();
      card.find(this.pia_id).then((entry: any) => {
        this.pia_name = entry.name;
      });
    });

    // Generate the navigation
    const kb = this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
      this.data = data;
    });
  }
}
