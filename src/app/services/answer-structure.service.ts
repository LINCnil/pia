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

  removeMeasure(sid: {section_id: number, item_id: number, measure_id}): void {
    this.structure.data.sections.filter(s =>
      s.id === sid.section_id)[0].items.filter(
        i => i.id === sid.item_id)[0].answers.splice(sid.measure_id, 1);
    this.structureService.update(this.structure).then(() => {
      this.measureToRemove.next(sid.measure_id);
    });
  }

  removeQuestion(sid: {section_id: number, item_id: number, question_id}): void {
    const index = this.structure.data.sections.filter(
      s => s.id === sid.section_id)[0].items.filter(
        i => i.id === sid.item_id)[0].questions.findIndex(q => q.id === sid.question_id);
    if (index !== -1) {
      this.structure.data.sections.filter(
        s => s.id === sid.section_id)[0].items.filter(
          i => i.id === sid.item_id)[0].questions.splice(index, 1);
      this.structureService.update(this.structure);
      this.questionToRemove.next(index);
    }
    this.modalsService.closeModal();
  }
}
