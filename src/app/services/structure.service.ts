import { Injectable, ResolvedReflectiveFactory } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Structure } from 'app/structures/structure.model';
import { ModalsService } from 'app/modals/modals.service';

@Injectable()
export class StructureService {

  structures = [];
  structure: Structure = new Structure();

  constructor(private route: ActivatedRoute,
              private _modalsService: ModalsService) {
                this.getStructure();
              }

  /**
   * Get the Structure.
   * @return {Promise}
   * @memberof StructureService
   */
  async getStructure() {
    return new Promise((resolve, reject) => {
      const id = parseInt(this.route.snapshot.params['structure_id'], 10);
      this.structure.get(id).then(() => {
        resolve();
      });
    });
  }

  updateJson(section: any, item: any, question: any) {
    this.structure.data.sections.find(s => s.id === section.id).items.find(i => i.id === item.id).questions.find(q => q.id === question.id).title = question.title;
    this.structure.data.sections.find(s => s.id === section.id).items.find(i => i.id === item.id).questions.find(q => q.id === question.id).answer = question.answer;
    this.structure.update();
  }

  updateMeasureJson(section: any, item: any, measure: any, id: number) {
    this.structure.data.sections.find(s => s.id === section.id).items.find(i => i.id === item.id).answers[id] = measure;
    this.structure.update();
  }

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
    this.getStructure().then(() => {
      this.structure.data.sections.find(s => s.id === section_id).items.find(i => i.id === item_id).answers.splice(measure_id, 1);
      this.structure.update().then(() => {
        localStorage.removeItem('measure-id');
        this._modalsService.closeModal();
      });
    });
  }

  removeQuestion() {
    const sid = localStorage.getItem('question-id').split(',');
    const section_id = parseInt(sid[0], 10);
    const item_id = parseInt(sid[1], 10);
    const question_id = parseInt(sid[2], 10);
    this.getStructure().then(() => {
      const index = this.structure.data.sections.find(s => s.id === section_id).items.find(i => i.id === item_id).questions.findIndex(q => q.id === question_id);

      if (index !== -1) {
        this.structure.data.sections.find(s => s.id === section_id).items.find(i => i.id === item_id).questions.splice(index, 1);
        this.structure.update();
      }

      localStorage.removeItem('question-id');
      this._modalsService.closeModal();
    });
  }

  /**
   * Allows an user to remove a Structure.
   * @memberof StructureService
   */
  removeStructure() {
    const id = parseInt(localStorage.getItem('structure-id'), 10);

    // Removes from DB.
    const structure = new Structure();
    structure.delete(id);

    // Deletes the PIA from the view.
    if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
      document.querySelector('.app-list-item[data-id="' + id + '"]').remove();
    } else {
      document.querySelector('.pia-cardsBlock.pia[data-id="' + id + '"]').remove();
    }

    localStorage.removeItem('structure-id');
    this._modalsService.closeModal();
  }

  /**
   * Allow an user to duplicate a Structure.
   * @param {number} id - The Structure id.
   * @memberof StructureService
   */
  duplicateStructure(id: number) {
    this.exportStructureData(id).then((data) => {
      this.importStructureData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a Structure.
   * @param {number} id - The Structure id.
   * @returns {Promise}
   * @memberof StructureService
   */
  exportStructureData(id: number) {
    return new Promise((resolve, reject) => {
      const structure = new Structure();
      structure.get(id).then(() => {
        const data = {
          structure: structure
        }
        resolve(data);
      });
    });
  }

  /**
   * Allow an user to import a Structure.
   * @param {*} data - Data Structure.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate Structure?
   * @memberof StructureService
   */
  async importStructureData(data: any, prefix: string, is_duplicate: boolean) {
    if (!('structure' in data) || !('dbVersion' in data.structure)) {
      return;
    }
    const structure = new Structure();
    structure.name = '(' + prefix + ') ' + data.structure.name;
    structure.sector_name = data.structure.sector_name;
    structure.data = data.structure.data;

    if (is_duplicate) {
      structure.created_at = new Date();
      structure.updated_at = new Date();
    } else {
      structure.created_at = new Date(data.structure.created_at);
      if (data.structure.updated_at) {
        structure.updated_at = new Date(data.structure.updated_at);
      }
    }

    structure.create().then((structure_id: number) => {
      this.structures.push(structure);
    });
  }

  /**
   * Download the Structure exported.
   * @param {number} id - The Structure id.
   * @memberof StructureService
   */
  exportStructure(id: number) {
    const date = new Date().getTime();
    this.exportStructureData(id).then((data) => {
      const a = document.getElementById('pia-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_structure_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  /**
   * Import the Structure from file.
   * @param {*} file - The exported Structure file.
   * @memberof StructureService
   */
  async importStructure(file: any) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = (event: any) => {
      const jsonFile = JSON.parse(event.target.result);
      this.importStructureData(jsonFile, 'IMPORT', false);
    }
  }
}
