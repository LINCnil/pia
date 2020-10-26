import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Structure } from '../models/structure.model';
import { ModalsService } from './modals.service';
import { StructureService } from './structure.service';


@Injectable()
export class AnswerStructureService {

  structure: Structure = new Structure();
  measureToRemove = new Subject<number>();
  questionToRemove = new Subject<number>();

  constructor(private modalsService: ModalsService, private structureService: StructureService) {}


  async addQuestion(structure: Structure, section: any, item: any) {
    return new Promise((resolve, reject) => {
        const questions = structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].questions;
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
        structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].questions.push(question);
        this.structureService.update(this.structure).then(() => {
          this.structure = structure;
          resolve(question);
        });
      });
  }

  async addMeasure(structure: Structure, section: any, item: any) {
    return new Promise((resolve, reject) => {
        const measure = {
          'title': '',
          'content': ''
        }
        structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].answers.push(measure);
        this.structureService.update(structure).then(() => {
          resolve(measure);
        });
      });
  }

  removeMeasure() {
    const sid = localStorage.getItem('measure-id').split(',');

    const section_id = parseInt(sid[0], 10);
    const item_id = parseInt(sid[1], 10);
    const measure_id = parseInt(sid[2], 10);
    this.structure.data.sections.filter(s => s.id === section_id)[0].items.filter(i => i.id === item_id)[0].answers.splice(measure_id, 1);
    this.structureService.update(this.structure).then(() => {
      this.measureToRemove.next(measure_id);
      localStorage.removeItem('measure-id');
      this.modalsService.closeModal();
    });
  }

  removeQuestion() {
    const sid = localStorage.getItem('question-id').split(',');
    const section_id = parseInt(sid[0], 10);
    const item_id = parseInt(sid[1], 10);
    const question_id = parseInt(sid[2], 10);
    const index = this.structure.data.sections.filter(s => s.id === section_id)[0].items.filter(i => i.id === item_id)[0].questions.findIndex(q => q.id === question_id);
    if (index !== -1) {
      this.structure.data.sections.filter(s => s.id === section_id)[0].items.filter(i => i.id === item_id)[0].questions.splice(index, 1);
      this.structureService.update(this.structure);
      this.questionToRemove.next(index);
    }
    localStorage.removeItem('question-id');
    this.modalsService.closeModal();
  }
}
