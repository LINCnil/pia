import { Component, OnInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { DndDropEvent } from 'ngx-drag-drop';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

import { PiaModel, FolderModel, ProcessingModel } from '@api/models';
import { PiaApi, FolderApi, ProcessingApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';
import { AuthenticationService } from '@security/authentication.service';
import { ProfileSession } from '../services/profile-session.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})

export class CardsComponent implements OnInit, OnDestroy {
  newProcessing: ProcessingModel;
  processingForm: FormGroup;
  // importPiaForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string }
  view: 'card';
  paramsSubscribe: Subscription;
  folderId: number;
  itemToMove: any = null;
  // canCreatePIA: boolean;
  canCreateProcessing: boolean;
  public structure: any;

  constructor(
    private router: Router,
    private el: ElementRef,
    private route: ActivatedRoute,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    private permissionsService: PermissionsService,
    private processingApi: ProcessingApi,
    private folderApi: FolderApi,
    private session: ProfileSession
  ) { }

  ngOnInit() {
    this.structure = this.session.getCurrentStructure();
    this.permissionsService.hasPermission('CanCreateProcessing').then((bool: boolean) => {
      this.canCreateProcessing = bool;
    });
    this.applySortOrder();
    // this.initPiaForm();
    this.initProcessingForm();
  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
  }

  /**
   * Sort items.
   * @param {string} fieldToSort - Field to sort.
   * @memberof CardsComponent
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortElements();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   * @memberof CardsComponent
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   * @memberof CardsComponent
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   * @memberof CardsComponent
   */
  async refreshContent() {
    const theFolders = await this.fetchFolders();

    this.handleFoldersCollection(theFolders);

    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    this.sortElements();
  }

  protected fetchFolders() {
    if (this.folderId !== null) {
      return this.folderApi.get(this.structure.id, this.folderId).toPromise()
    }
    return this.folderApi.getAll(this.structure.id).toPromise();
  }

  protected handleFoldersCollection(folderOrFolderCollection: any) {
    let folder: FolderModel;
    if (folderOrFolderCollection instanceof FolderModel) {
      folder = folderOrFolderCollection;
    } else {
      folder = folderOrFolderCollection[0];
    }
    this._piaService.currentFolder = folder;
    this._piaService.processings = folder.processings;
    this._piaService.folders = folder.children;
  }

  /**
   * Define how to sort the list.
   * @private
   * @memberof CardsComponent
   */
  protected sortElements() {
    if (this._piaService.pias !== undefined) {
      this._piaService.pias.sort((a, b) => {
        let firstValue = a[this.sortValue];
        let secondValue = b[this.sortValue];
        if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
          firstValue = new Date(a[this.sortValue]);
          secondValue = new Date(b[this.sortValue]);
        }
        if (this.sortValue === 'name' || this.sortValue === 'author_name' ||
          this.sortValue === 'evaluator_name' || this.sortValue === 'validator_name') {
          return firstValue.localeCompare(secondValue);
        } else {
          if (firstValue < secondValue) {
            return -1;
          }
          if (firstValue > secondValue) {
            return 1;
          }
          return 0;
        }
      });
      if (this.sortOrder === 'up') {
        this._piaService.pias.reverse();
      }
    }
    // TODO: sort processings
  }

  protected applySortOrder() {
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');

    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }
  }

  protected initProcessingForm() {
    this.processingForm = new FormGroup({
      name: new FormControl(),
      author: new FormControl(),
      controllers: new FormControl()
    });
    this.viewStyle = {
      view: this.route.snapshot.params['view']
    }
    this.paramsSubscribe = this.route.params.subscribe(
      (params: Params) => {
        this.viewStyle.view = params['view'];
        this.folderId = (params.id ? params.id : null)
        if (localStorage.getItem('homepageDisplayMode') === 'list') {
          this.viewOnList();
        } else {
          this.viewOnCard();
        }
      }
    );
  }

  onDragStart(item: any) {
    this.itemToMove = item;
  }

  onDragCanceled() {
    this.itemToMove = null;
  }

  onDrop(targetFolder: FolderModel) {
    if (this.itemToMove) {
      if (this.itemToMove instanceof FolderModel) {
        if (this.itemToMove.id === parseInt(targetFolder.id, 10)) {
          return;
        }

        this.itemToMove.parent = targetFolder;

        this.folderApi.update(this.itemToMove).subscribe(() => {
          this.refreshContent();
        });

        return;
      }

      this.itemToMove.folder = targetFolder;

      this.processingApi.update(this.itemToMove).subscribe(() => {
        this.refreshContent();
      });
    }
  }

  private currentFolderIsRoot(): boolean {
    return this._piaService.currentFolder.parent.isRoot;
  }

  getRouteToParentFolder(): string {
    let route = '/folders';
    if (!this.currentFolderIsRoot()) {
      const parentId = this._piaService.currentFolder.parent.id;
      route = '/folders/' + parentId;
    }
    return route;
  }
}
