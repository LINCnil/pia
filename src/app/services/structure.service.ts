import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import structureExampleFr from 'src/assets/files/2018-11-21-structure-example-fr.json';
import structureExampleEn from 'src/assets/files/2018-11-21-structure-example-en.json';

import { LanguagesService } from 'src/app/services/languages.service';
import { Pia } from '../models/pia.model';
import { Structure } from '../models/structure.model';
import { ModalsService } from './modals.service';
import { ApplicationDb } from '../application.db';


@Injectable()
export class StructureService extends ApplicationDb {

  constructor(private route: ActivatedRoute,
              private languagesService: LanguagesService) {
                super(201808011000, 'structure');

  }


  /**
   * Find all entries without conditions.
   * @returns {Promise}
   */
  async getAll(): Promise<any> {
    const items = [];
    return new Promise((resolve, reject) => {
      this.findAll().then((entries: any) => {
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
      const exampleStructLanguage = this.languagesService.selectedLanguage === 'fr' ? structureExampleFr : structureExampleEn;
      const structureExample = new Structure();
      structureExample.id = 0;
      structureExample.name = exampleStructLanguage.structure.name;
      structureExample.sector_name = exampleStructLanguage.structure.sector_name;
      structureExample.created_at = new Date(exampleStructLanguage.structure.created_at);
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
      created_at: structure.created_at,
      updated_at: structure.updated_at
    };

    return new Promise((resolve, reject) => {
      if (this.serverUrl) {
        const formData = new FormData();
        for (const d in data) {
          if (data.hasOwnProperty(d)) {
            let value = data[d];
            if (d === 'data') {
              value = JSON.stringify(value);
            }
            formData.append('structure[' + d + ']', value);
          }
        }
        fetch(this.getServerUrl(), {
          method: 'POST',
          body: formData,
          mode: 'cors'
        }).then((response) => {
          return response.json();
        }).then((result: any) => {
          resolve(result.id);
        }).catch ((error) => {
          console.error('Request failed', error);
          reject();
        });
      } else {
        this.getObjectStore().then(() => {
          const evt = this.objectStore.add(data);
          evt.onerror = (event: any) => {
            console.error(event);
            reject(Error(event));
          }
          evt.onsuccess = (event: any) => {
            resolve(event.target.result);
          };
        });
      }
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
      this.find(structure.id).then((entry: any) => {
        entry.name = structure.name;
        entry.sector_name = structure.sector_name;
        entry.data = structure.data;
        entry.updated_at = new Date();
        if (this.serverUrl) {
          const formData = new FormData();
          for (const d in entry) {
            if (entry.hasOwnProperty(d)) {
              let value = entry[d];
              if (d === 'data') {
                value = JSON.stringify(value);
              }
              formData.append('structure[' + d + ']', value);
            }
          }
          fetch(this.getServerUrl() + '/' + entry.id, {
            method: 'PATCH',
            body: formData,
            mode: 'cors'
          }).then((response) => {
            return response.json();
          }).then((result: any) => {
            resolve();
          }).catch ((error) => {
            console.error('Request failed', error);
            reject();
          });
        } else {
          this.getObjectStore().then(() => {
            const evt = this.objectStore.put(entry);
            evt.onerror = (event: any) => {
              console.error(event);
              reject(Error(event));
            };
            evt.onsuccess = (event: any) => {
              resolve(event.target.result);
            };
          });
        }
      });
    });
  }

  updateJson(section: any, item: any, question: any, structure: Structure): void {
    structure.data.sections.filter(
      s => s.id === section.id)[0].items.filter(
        i => i.id === item.id)[0].questions.filter(q => q.id === question.id)[0].title = question.title;
    structure.data.sections.filter(
      s => s.id === section.id)[0].items.filter(
        i => i.id === item.id)[0].questions.filter(q => q.id === question.id)[0].answer = question.answer;
    this.update(structure);
  }

  updateMeasureJson(section: any, item: any, measure: any, id: number, structure: Structure): void {
      structure.data.sections.filter(s => s.id === section.id)[0].items.filter(i => i.id === item.id)[0].answers[id] = measure;
      this.update(structure);
  }

  /**
   * Allows an user to remove a Structure.
   */
  removeStructure(id): void {
    // Removes from DB.
    const structure = new Structure();
    this.delete(id).then( () => {
      const pia = new Pia();
      pia.getAllWithStructure(id).then((items: any) => {
        items.forEach(item => {
          item.structure_id = null;
          pia.updateEntry(item);
        });
      });
    });
  }

  /**
   * Allow an user to duplicate a Structure.
   * @param {number} id - The Structure id.
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
   */
  exportStructureData(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const structure = new Structure();
      if (id > 0) {
        this.find(id).then((structure: Structure) => {
          const data = {
            structure
          };
          resolve(data);
        });
      } else {
        const exampleStructLanguage = this.languagesService.selectedLanguage === 'fr' ? structureExampleFr : structureExampleEn;
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
      if (!('structure' in data) || !('dbVersion' in data.structure)) {
        // this.modalsService.openModal('import-wrong-structure-file');
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

      this.create(structure).then((result: Structure) => {
        structure.id = result.id;
        resolve(structure);
      });
    });
  }

  /**
   * Download the Structure exported.
   * @param {number} id - The Structure id.
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
   */
  async importStructure(file: any): Promise<Structure> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event: any) => {
        const jsonFile = JSON.parse(event.target.result);
        this.importStructureData(jsonFile, 'IMPORT', false)
          .then((structure: Structure) => {
            resolve(structure);
          })
          .catch((err) => {
            console.error(err);
          });
      };
    });
  }

  // UPDATE
  remove(id): Promise<void> {
    return new Promise((resolve, reject) => {
      // Removes from DB.
      const structure = new Structure();
      this.delete(id)
        .then( () => {
          const pia = new Pia();
          pia.getAllWithStructure(id).then((items: any) => {
            items.forEach(item => {
              item.structure_id = null;
              pia.updateEntry(item);
            });
          });
          localStorage.removeItem('structure-id');
          resolve();
        })
        .catch(err => {
          console.error(err);
        });
    });
  }
}
