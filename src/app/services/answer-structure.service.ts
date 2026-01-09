import { Injectable } from '@angular/core';
import { Structure } from '../models/structure.model';
import { StructureService } from './structure.service';
import { KnowledgeBaseService } from './knowledge-base.service';

@Injectable()
export class AnswerStructureService {
  // measureToRemove = new Subject<number>();
  // questionToRemove = new Subject<number>();

  constructor(
    private structureService: StructureService,
    private knowledgeBaseService?: KnowledgeBaseService
  ) {}

  async addQuestion(
    structure: Structure,
    section: any,
    item: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const questions = structure.data.sections
        .filter(s => s.id === section.id)[0]
        .items.filter(i => i.id === item.id)[0].questions;
      const question_id =
        section.id.toString() +
        item.id.toString() +
        (questions.length + 1).toString();
      const question = {
        id: parseInt(question_id, 10),
        title: '',
        link_knowledge_base: [],
        placeholder: '',
        answer_type: 'text',
        answer: '',
        active: true
      };

      structure.data.sections
        .filter(s => s.id === section.id)[0]
        .items.filter(i => i.id === item.id)[0]
        .questions.push(question);

      this.structureService.update(structure).then(() => {
        resolve(question);
      });
    });
  }

  async addMeasure(
    structure: Structure,
    section: any,
    item: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const measure = {
        title: '',
        content: ''
      };

      structure.data.sections
        .filter(s => s.id === section.id)[0]
        .items.filter(i => i.id === item.id)[0]
        .answers.push(measure);

      this.structureService.update(structure).then(() => {
        resolve(measure);
      });
    });
  }

  removeMeasure(
    structure: Structure,
    section_id: number,
    item_id: number,
    measure_id: number,
    measure_name: string
  ): void {
    structure.data.sections
      .filter(s => s.id === section_id)[0]
      .items.filter(i => i.id === item_id)[0]
      .answers.splice(measure_id, 1);
    this.structureService.update(structure).then(() => {
      // this.measureToRemove.next(measure_id);
      this.knowledgeBaseService.toHide = this.knowledgeBaseService.toHide.filter(
        item => item !== measure_name
      );
    });
  }

  removeQuestion(
    structure: Structure,
    section_id: number,
    item_id: number,
    question_id
  ): void {
    const index = structure.data.sections
      .filter(s => s.id === section_id)[0]
      .items.filter(i => i.id === item_id)[0]
      .questions.findIndex(q => q.id === question_id);
    if (index !== -1) {
      structure.data.sections
        .filter(s => s.id === section_id)[0]
        .items.filter(i => i.id === item_id)[0]
        .questions.splice(index, 1);
      this.structureService.update(structure);
      // this.questionToRemove.next(index);
    }
  }
}
