import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Http } from '@angular/http';
import { Pia } from './pia.model';

@Component({
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {

  measureTitle: string;
  measurePlaceholder: string;

  @Output() pia: Pia;
  @Output() section: { id: number, title: string, display_mode: string, short_help: string, items: any };
  @Output() item: { id: number, title: string, evaluation_mode: string, short_help: string, questions: any };
  @Output() data: { sections: any };
  @Output() questions: any;

  constructor(private route: ActivatedRoute, private http: Http) {
    let sectionId = parseInt(this.route.snapshot.params['section_id'], 10);
    let itemId = parseInt(this.route.snapshot.params['item_id'], 10);
    const piaId = parseInt(this.route.snapshot.params['id'], 10);
    this.pia = new Pia();
    this.pia.get(piaId);
    this.http.request('/assets/files/pia_architecture.json').map(res => res.json()).subscribe(data => {
      this.data = data;
      this.getSectionAndItem(sectionId, itemId);
      this.route.params.subscribe(
        (params: Params) => {
          sectionId = parseInt(params['section_id'], 10);
          itemId = parseInt(params['item_id'], 10);
          this.getSectionAndItem(sectionId, itemId);
        }
      );
    });
  }

  ngOnInit() { }

  addNewMeasure(item) {
    this.measureTitle = item.name;
    this.measurePlaceholder = item.placeholder !== undefined ? item.placeholder : 'Ajoutez les mesures prises pour garantir la sécurité des données.';
  }

  private getSectionAndItem(sectionId, itemId) {
    this.section = this.data['sections'].filter((section) => {
      return section.id === sectionId;
    })[0];
    this.item = this.section['items'].filter((item) => {
      return item.id === itemId;
    })[0];
    this.questions = [];
    if (this.section.display_mode === 'all_items') {
      if (this.section['items']) {
        this.section['items'].forEach(item => {
          item['questions'].forEach(question => {
            this.questions.push(question);
          });
        });
      }
    } else if (this.item['questions']) {
      this.item['questions'].forEach(question => {
        this.questions.push(question);
      });
    }
  }
}
