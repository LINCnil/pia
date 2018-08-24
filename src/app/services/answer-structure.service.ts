import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Structure } from 'app/structures/structure.model';
import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class AnswerStructureService {

  structure: Structure = new Structure();
  measureToRemove = new Subject<number>();
  questionToRemove = new Subject<number>();

  constructor(private _modalsService: ModalsService) {}


  async addQuestion(section: any, item: any) {
    return new Promise((resolve, reject) => {
        const questions = this.structure.data.sections.find(s => s.id === section.id).items.find(i => i.id === item.id).questions;
        const question_id = section.id.toString() + item.id.toString() + (questions.length + 1).toString();
        const question = {
          'id': parseInt(question_id, 10),
          'title': '',
          'link_knowledge_base': [],
          'placeholder': '',
          'answer_type': 'text',
          'answer': '',
          'active': true
        };
        this.structure.data.sections.find(s => s.id === section.id).items.find(i => i.id === item.id).questions.push(question);
        this.structure.update().then(() => {
          resolve(question);
        });
      });
  }

  async addMeasure(section: any, item: any) {
    return new Promise((resolve, reject) => {
        const measure = {
          'title': '',
          'content': ''
        }
        this.structure.data.sections.find(s => s.id === section.id).items.find(i => i.id === item.id).answers.push(measure);
        this.structure.update().then(() => {
          resolve(measure);
        });
      });
  }

  removeMeasure() {
    const sid = localStorage.getItem('measure-id').split(',');
    const section_id = parseInt(sid[0], 10);
    const item_id = parseInt(sid[1], 10);
    const measure_id = parseInt(sid[2], 10);
      this.structure.data.sections.find(s => s.id === section_id).items.find(i => i.id === item_id).answers.splice(measure_id, 1);
      this.structure.update().then(() => {
        this.measureToRemove.next(measure_id);
        localStorage.removeItem('measure-id');
        this._modalsService.closeModal();
      });

  }

  removeQuestion() {
    const sid = localStorage.getItem('question-id').split(',');
    const section_id = parseInt(sid[0], 10);
    const item_id = parseInt(sid[1], 10);
    const question_id = parseInt(sid[2], 10);

      const index = this.structure.data.sections.find(s => s.id === section_id).items.find(i => i.id === item_id).questions.findIndex(q => q.id === question_id);

      if (index !== -1) {
        this.structure.data.sections.find(s => s.id === section_id).items.find(i => i.id === item_id).questions.splice(index, 1);
        this.structure.update();
        this.questionToRemove.next(index);
      }

      localStorage.removeItem('question-id');
      this._modalsService.closeModal();

  }
}
