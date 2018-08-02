import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { AppDataService } from '../services/app-data.service';
import { ModalsService } from '../modals/modals.service';

import { Observable } from 'rxjs/Observable';
import { ProcessingModel, FolderModel } from '@api/models';
import { ProcessingApi, FolderApi } from '@api/services';

@Injectable()
export class ProcessingService {

  processings = [];
  folders = [];
  currentFolder: FolderModel = null
  isRootFolder = false
  processing: ProcessingModel = new ProcessingModel();
  data: { sections: any };

  constructor(
    private _router: Router,
    private _appDataService: AppDataService,
    private _modalsService: ModalsService,
    private processingApi: ProcessingApi,
    private folderApi: FolderApi
  ) {
    this._appDataService.getDataNav().then((dataNav) => {
      this.data = dataNav;
    });
  }

  /**
   * Get the Processing.
   * @return {Promise}
   * @memberof ProcessingService
   * @deprecated
   */
  getProcessing() {
    console.warn('getProcessing is deprecated');
    return new Promise((resolve, reject) => { resolve(this.processing) });
  }

  /**
   * Get the current Processing.
   * @return { Observable<ProcessingModel> }
   * @memberof ProcessingService
   */
  retrieveCurrentProcessing(id: number): Observable<ProcessingModel> {
    return this.processingApi.get(id).map((theProcessing: ProcessingModel) => {
      this.processing.fromJson(theProcessing);

      return this.processing;
    });

  }

  /**
   * Allows a user to remove a Processing.
   * @memberof ProcessingService
   */
  removeProcessing() {
    const processingID = parseInt(localStorage.getItem('processing-id'), 10);
    // Deletes from DB.
    this.processingApi.deleteById(processingID).subscribe(() => {
      // Removes the Processing from the view.
      if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
        document.querySelector('.app-list-item[data-id="' + processingID + '"]').remove();
      } else {
        document.querySelector('.processing-cardsBlock.processing[data-id="' + processingID + '"]').remove();
      }

      localStorage.removeItem('processing-id');
    });


    this._modalsService.closeModal();
  }

  /**
   * Remove a folder
   */
  removeFolder() {
    const folderID = parseInt(localStorage.getItem('folder-id'), 10);
    const structureID = parseInt(localStorage.getItem('structure-id'), 10);
    // Deletes from DB.
    this.folderApi.deleteById(structureID, folderID).subscribe(() => {
      // Removes the Folder from the view.
      if (localStorage.getItem('homepageDisplayMode') && localStorage.getItem('homepageDisplayMode') === 'list') {
        document.querySelector('tr.app-list-item-folder[data-id="' + folderID + '"]').remove();
      } else {
        document.querySelector('.processing-folder-item[data-id="' + folderID + '"]').remove();
      }
      localStorage.removeItem('folder-id');
    });

    this._modalsService.closeModal();
  }

  /**
   * Allows a user to abandon a treatment (archive a Processing).
   * @memberof ProcessingService
   */
  abandonTreatment() {
    this.processingApi.update(this.processing).subscribe((updatedProcessing: ProcessingModel) => {
      this.processing.fromJson(updatedProcessing);
      this._modalsService.closeModal();
      this._router.navigate(['home']);
    });
  }

  /**
   * Allow a user to duplicate a Processing.
   * @param {number} id - Processing id.
   * @memberof ProcessingService
   */
  duplicate(id: number) {
    this.exportData(id).then((data) => {
      this.importData(data, 'COPY', true);
    });
  }

  /**
   * Allow an user to export a Processing.
   * @param {number} id - The Processing id.
   * @returns {Promise}
   * @memberof ProcessingService
   */
  exportData(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.processingApi.export(id).subscribe((json) => {
        resolve(json);
      });
    });
  }

  /**
   * Allows a user to import a Processing.
   * @param {*} data - Data Processing.
   * @param {string} prefix - A title prefix.
   * @param {boolean} is_duplicate - Is a duplicate Processing?
   * @param {boolean} [is_example] - Is the Processing example?
   * @memberof ProcessingService
   */
  async importData(data: any, prefix: string, is_duplicate: boolean, is_example?: boolean): Promise<void> {
    this.processingApi.import(data).subscribe((processing) => {
      this.processings.push(processing);
    });
  }

  /**
   * Download the Processing exported.
   * @param {number} id - The Processing id.
   * @memberof ProcessingService
   */
  export(id: number) {
    const date = new Date().getTime();
    this.exportData(id).then((data) => {
      const a = document.getElementById('processing-exportBlock');
      const url = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
      a.setAttribute('href', url);
      a.setAttribute('download', date + '_export_processing_' + id + '.json');
      const event = new MouseEvent('click', {
        view: window
      });
      a.dispatchEvent(event);
    });
  }

  /**
   * Import the Processing from file.
   * @param {*} file - The exported Processing file.
   * @memberof ProcessingService
   */
  async import(file: any) {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    return new Promise((resolve, reject) => {
      reader.onload = async (event: any) => {
        const jsonFile = JSON.parse(event.target.result);
        await this.importData(jsonFile, 'IMPORT', false);
        resolve();
      }
    });
  }

  /**
   * Update current Processing
   * @returns {Observable<ProcessingModel>}
   * @memberof ProcessingService
   */
  public saveCurrentProcessing(): Observable<ProcessingModel> {
    return this.processingApi.update(this.processing).map((updatedProcessing: ProcessingModel) => {
      this.processing = updatedProcessing;

      return this.processing;
    });
  }
}
