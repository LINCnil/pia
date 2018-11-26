import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Structure } from 'app/structures/structure.model';
import { Pia } from 'app/entry/pia.model';

import { ModalsService } from 'app/modals/modals.service';
import { LanguagesService } from 'app/services/languages.service';


@Injectable()
export class StructureService {
  public behaviorSubject = new BehaviorSubject<boolean>(null);
  structures = [];
  structure: Structure = new Structure();

  constructor(private route: ActivatedRoute,
              private _http: Http,
              private _modalsService: ModalsService,
              private _languagesService: LanguagesService) {
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
      if (id > 0) {
        this.structure.get(id).then(() => {
          resolve();
        });
      } else {
        this.loadExample().then((se: Structure) => {
          this.structure = se;
          this.behaviorSubject.next(true);
          resolve();
        });
      }
    });
  }

  async loadExample() {
    return new Promise((resolve, reject) => {
      const exampleStructLanguage = this._languagesService.selectedLanguage === 'fr' ? 'fr' : 'en';
      this._http.get('./assets/files/2018-11-21-structure-example-' + exampleStructLanguage + '.json').map(res => res.json()).subscribe(dataStructure => {
        const structureExample = new Structure();
        structureExample.id = 0;
        structureExample.name = dataStructure.structure.name;
        structureExample.sector_name = dataStructure.structure.sector_name;
        structureExample.created_at = dataStructure.structure.created_at;
        structureExample.data = dataStructure.structure.data;
        structureExample.is_example = true;
        resolve(structureExample);
      });
    });
  }

  updateJson(section: any, item: any, question: any) {
    this.getStructure().then(() => {
      this.structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].questions.filter(q => q.id === question.id)[0].title = question.title;
      this.structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].questions.filter(q => q.id === question.id)[0].answer = question.answer;
      this.structure.update();
    });
  }

  updateMeasureJson(section: any, item: any, measure: any, id: number) {
    this.getStructure().then(() => {
      this.structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].answers[id] = measure;
      this.structure.update();
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
    structure.delete(id).then( () => {
      const pia = new Pia();
      pia.getAllWithStructure(id).then((items: any) => {
        items.forEach(item => {
          item.structure_id = null;
          pia.updateEntry(item);
        });
      });
    });

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
  async duplicateStructure(id: number) {
    return new Promise((resolve, reject) => {
      this.exportStructureData(id).then((data) => {
        this.importStructureData(data, 'COPY', true).then((structure) => {
          resolve(structure);
        });
      });
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
      if (id > 0) {
        structure.get(id).then(() => {
          const data = {
            structure: structure
          }
          resolve(data);
        });
      } else {
        const exampleStructLanguage = this._languagesService.selectedLanguage === 'fr' ? 'fr' : 'en';
        this._http.get('./assets/files/2018-11-21-structure-example-' + exampleStructLanguage + '.json').map(res => res.json()).subscribe(dataStructure => {
          resolve(dataStructure);
        });
      }
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
    return new Promise((resolve, reject) => {
      if (!('structure' in data) || !('dbVersion' in data.structure)) {
        this._modalsService.openModal('import-wrong-structure-file');
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
        structure.id = structure_id;
        resolve(structure);
      });
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event: any) => {
        const jsonFile = JSON.parse(event.target.result);
        this.importStructureData(jsonFile, 'IMPORT', false).then((structure) => {
          this.structures.push(structure);
        });
      }
    });
  }
}
