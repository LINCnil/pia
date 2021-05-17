import { Injectable } from '@angular/core';

import structureExampleFr from 'src/assets/files/2018-11-21-structure-example-fr.json';
import structureExampleEn from 'src/assets/files/2018-11-21-structure-example-en.json';

import { LanguagesService } from 'src/app/services/languages.service';
import { Structure } from '../models/structure.model';
import { ApplicationDb } from '../application.db';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable()
export class StructureService extends ApplicationDb {
  constructor(
    private router: Router,
    protected apiService: ApiService,
    private languagesService: LanguagesService
  ) {
    super(201808011000, 'structure');
    super.prepareApi(this.apiService);
    super.prepareServerUrl(this.router);
  }

  /**
   * Find all entries without conditions.
   * @returns {Promise}
   */
  async getAll(): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      super.findAll().then((entries: any) => {
        if (entries && entries.length > 0) {
          entries.forEach(element => {
            const newStructure = new Structure();
            newStructure.id = element.id;
            newStructure.name = element.name;
            newStructure.sector_name = element.sector_name;
            newStructure.data = element.data;
            newStructure.created_at = new Date(element.created_at);
            newStructure.updated_at = new Date(element.updated_at);
            items.push(newStructure);
          });
        }
        resolve(items);
      });
    });
  }

  async loadExample(): Promise<any> {
    return new Promise((resolve, reject) => {
      const exampleStructLanguage =
        this.languagesService.selectedLanguage === 'fr'
          ? structureExampleFr
          : structureExampleEn;
      const structureExample = new Structure();
      structureExample.id = 0;
      structureExample.name = exampleStructLanguage.structure.name;
      structureExample.sector_name =
        exampleStructLanguage.structure.sector_name;
      structureExample.created_at = new Date(
        exampleStructLanguage.structure.created_at
      );
      structureExample.data = exampleStructLanguage.structure.data;
      structureExample.is_example = true;
      resolve(structureExample);
    });
  }

  /**
   * Create a new Structure.
   * @returns {Promise}
   */
  async create(structure): Promise<Structure> {
    if (this.created_at === undefined) {
      this.created_at = new Date();
    }

    const data = {
      name: structure.name,
      sector_name: structure.sector_name,
      data: structure.data,
      created_at: new Date(),
      updated_at: new Date()
    };

    return new Promise((resolve, reject) => {
      super
        .create(data, 'structure')
        .then((result: any) => {
          resolve(result.id);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Update a Structure.
   * @returns {Promise}
   */
  async update(structure): Promise<any> {
    if (structure.is_example) {
      return;
    }
    return new Promise((resolve, reject) => {
      super.find(structure.id).then((entry: any) => {
        entry.name = structure.name;
        entry.sector_name = structure.sector_name;
        entry.data = structure.data;
        entry.updated_at = new Date();

        super
          .update(entry.id, entry, 'structure')
          .then((result: any) => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      });
    });
  }

  updateJson(
    section: any,
    item: any,
    question: any,
    structure: Structure
  ): void {
    structure.data.sections
      .filter(s => s.id === section.id)[0]
      .items.filter(i => i.id === item.id)[0]
      .questions.filter(q => q.id === question.id)[0].title = question.title;
    structure.data.sections
      .filter(s => s.id === section.id)[0]
      .items.filter(i => i.id === item.id)[0]
      .questions.filter(q => q.id === question.id)[0].answer = question.answer;
    this.update(structure);
  }

  updateMeasureJson(
    section: any,
    item: any,
    measure: any,
    id: number,
    structure: Structure
  ): void {
    structure.data.sections
      .filter(s => s.id === section.id)[0]
      .items.filter(i => i.id === item.id)[0].answers[id] = measure;
    this.update(structure);
  }

  /**
   * Allow an user to duplicate a Structure.
   * @param {number} id - The Structure id.
   */
  async duplicateStructure(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.exportStructureData(id).then(data => {
        this.importStructureData(data, 'COPY', true).then(structure => {
          resolve(structure);
        });
      });
    });
  }

  /**
   * Allow an user to export a Structure.
   * @param {number} id - The Structure id.
   * @returns {Promise}
   */
  exportStructureData(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const structure = new Structure();
      if (id > 0) {
        super.find(id).then(result => {
          const data = {
            structure: result
          };
          resolve(data);
        });
      } else {
        const exampleStructLanguage =
          this.languagesService.selectedLanguage === 'fr'
            ? structureExampleFr
            : structureExampleEn;
        resolve(exampleStructLanguage);
      }
    });
  }

  /**
   * Allow an user to import a Structure.
   * @param {*} data - Data Structure.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate Structure?
   */
  async importStructureData(data: any, prefix: string, is_duplicate: boolean) {
    return new Promise((resolve, reject) => {
      if (!data.structure) {
        reject(new Error('wrong pia file'));
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

      this.create(structure)
        .then((result: Structure) => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Download the Structure exported.
   * @param {number} id - The Structure id.
   */
  exportStructure(id: number) {
    const date = new Date().getTime();
    this.exportStructureData(id).then(data => {
      const a = document.getElementById('pia-exportBlock');
      const url =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(data));
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
   */
  async importStructure(file: any): Promise<Structure> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event: any) => {
        try {
          const jsonFile = JSON.parse(event.target.result);
          this.importStructureData(jsonFile, 'IMPORT', false)
            .then((structure: Structure) => {
              resolve(structure);
            })
            .catch(err => {
              console.error(err);
            });
        } catch {
          reject(false);
        }
      };
    });
  }

  // UPDATE
  remove(id): Promise<any> {
    return new Promise((resolve, reject) => {
      // Removes from DB.
      super
        .delete(id)
        .then(res => {
          localStorage.removeItem('structure-id');
          resolve(res);
        })
        .catch(err => {
          console.error(err);
        });
    });
  }
}
