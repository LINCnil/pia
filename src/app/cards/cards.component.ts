import { Component, OnInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { DndDropEvent } from 'ngx-drag-drop';

import { ModalsService } from 'app/modals/modals.service';
import { PiaService } from 'app/entry/pia.service';

import { PiaModel, FolderModel } from '@api/models';
import { PiaApi, FolderApi } from '@api/services';
import { PermissionsService } from '@security/permissions.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  providers: [FolderApi]
})

export class CardsComponent implements OnInit, OnDestroy {
  @Input() pia: any;
  newPia: PiaModel;
  piaForm: FormGroup;
  importPiaForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string }
  view: 'card';
  paramsSubscribe: Subscription;
  folderId: number;
  itemToMove: any = null;
  canCreatePIA: boolean;

  constructor(
    private router: Router,
    private el: ElementRef,
    private route: ActivatedRoute,
    public _modalsService: ModalsService,
    public _piaService: PiaService,
    private piaApi: PiaApi,
    private folderApi: FolderApi,
    private permissionsService: PermissionsService
  ) { }

  ngOnInit() {
    // add permission verification
    const hasPerm$ = this.permissionsService.hasPermission('CanCreatePIA');
    hasPerm$.then((bool: boolean) => {
      this.canCreatePIA = bool;
    });
    this.applySortOrder();
    this.initPiaForm();
  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
  }

  /**
   * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
   * @memberof CardsComponent
   */
  newPIA() {
    this.newPia = new PiaModel();
    const cardsToSwitch = document.getElementById('cardsSwitch');
    cardsToSwitch.classList.toggle('flipped');
    const rocketToHide = document.getElementById('pia-rocket');
    if (rocketToHide) {
      rocketToHide.style.display = 'none';
    }
  }

  /**
   * Inverse the order of the list.
   * @memberof CardsComponent
   */
  reversePIA() {
    const cardsToSwitchReverse = document.getElementById('cardsSwitch');
    cardsToSwitchReverse.classList.remove('flipped');
  }

  /**
   * Import a new PIA.
   * @param {*} [event] - Any Event.
   * @memberof CardsComponent
   */
  async importPia(event?: any) {
    if (event) {
      await this._piaService.import(event.target.files[0]);
      this.sortPia();
    } else {
      this.el.nativeElement.querySelector('#import_file').click();
    }
  }

  /**
   * Save the newly created PIA.
   * Sends to the path associated to this new PIA.
   * @memberof CardsComponent
   */
  onSubmit() {
    const pia = new PiaModel();
    pia.name = this.piaForm.value.name;
    pia.author_name = this.piaForm.value.author_name;
    pia.evaluator_name = this.piaForm.value.evaluator_name;
    pia.validator_name = this.piaForm.value.validator_name;
    const p = this.piaApi.create(pia, this._piaService.currentFolder).subscribe((newPia: PiaModel) => {
      this.router.navigate(['entry', newPia.id, 'section', 1, 'item', 1]);
    });
  }

  /**
   * Asort items created on PIA.
   * @param {string} fieldToSort - Field to sort.
   * @memberof CardsComponent
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortPia();
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
    this.sortPia();
  }

  protected fetchFolders() {
    if (this.folderId !== null) {
      return this.folderApi.get(this.folderId).toPromise()
    }
    return this.folderApi.getAll().toPromise()
  }

  protected handleFoldersCollection(folderOrFolderCollection: any) {
    let folder: FolderModel;
    if (folderOrFolderCollection instanceof FolderModel) {
      folder = folderOrFolderCollection;
    } else {
      folder = folderOrFolderCollection[0];
    }
    this._piaService.currentFolder = folder;
    this._piaService.pias = folder.pias;
    this._piaService.folders = folder.children;
  }

  /**
   * Define how to sort the list.
   * @private
   * @memberof CardsComponent
   */
  protected sortPia() {
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

  protected initPiaForm() {
    this.piaForm = new FormGroup({
      name: new FormControl(),
      author_name: new FormControl(),
      evaluator_name: new FormControl(),
      validator_name: new FormControl()
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

    this.importPiaForm = new FormGroup({
      import_file: new FormControl('', [])
    });
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
        if (this.itemToMove.id == targetFolder.id) {
          return;
        }

        this.itemToMove.parent = targetFolder;

        this.folderApi.update(this.itemToMove).subscribe(() => {
          this.refreshContent();
        });

        return;
      }

      this.itemToMove.folder = targetFolder;

      this.piaApi.update(this.itemToMove).subscribe(() => {
        this.refreshContent();
      });
    }
  }

  private currentFolderIsRoot(): boolean {
    return this._piaService.currentFolder.parent.isRoot;
  }

  getRouteToParentFolder():string {
    let route = '/folders';
    if (!this.currentFolderIsRoot()) {
      let parentId = this._piaService.currentFolder.parent.id;
      route = '/folders/' + parentId;
    }
    return route;
  }
}
