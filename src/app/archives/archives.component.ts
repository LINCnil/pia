import { Component, OnInit, ElementRef, OnDestroy, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { ArchiveService } from 'src/app/services/archive.service';
import { ModalsService } from 'src/app/modals/modals.service';
import { AppDataService } from 'src/app/services/app-data.service';

import { Pia } from '../entry/pia.model';

@Component({
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss'],
  providers: [ArchiveService]
})

export class ArchivesComponent implements OnInit, OnDestroy {
  @Input() archive: any;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string }
  view: 'archive';
  paramsSubscribe: Subscription;

  constructor(private router: Router,
              private el: ElementRef,
              private route: ActivatedRoute,
              public _modalsService: ModalsService,
              private _appDataService: AppDataService,
              public _archiveService: ArchiveService,
              private _translateService: TranslateService) { }

  ngOnInit() {
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }
    this.refreshContent();

    this.viewStyle = {
      view: this.route.snapshot.params.view
    };
    this.paramsSubscribe = this.route.params.subscribe(
      (params: Params) => {
        this.viewStyle.view = params.view;
      }
    );
    if (localStorage.getItem('homepageDisplayMode') === 'list') {
      this.viewOnList();
    } else {
      this.viewOnCard();
    }

  }

  ngOnDestroy() {
    this.paramsSubscribe.unsubscribe();
  }

  /**
   * On archive change.
   * @param {any} archive - Any Archive.
   */
  /* archiveChange(archive) {
    this._archiveService.archivedPias.push(archive);
  } */

  /**
   * Sort items from Archives.
   * @param {string} fieldToSort - Field to sort.
   */
  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortArchive();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   */
  viewOnList() {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['archives', 'list']);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  viewOnCard() {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    this.router.navigate(['archives', 'card']);
    this.refreshContent();
  }

  /**
   * Refresh the list.
   */
  async refreshContent() {
    const pia = new Pia();
    const data: any = await pia.getAll();

    this._archiveService.archivedPias = data;

    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    setTimeout(() => {
      this.sortArchive();
    }, 200);
  }

  /**
   * Defines how to sort the list.
   * @private
   */
  private sortArchive() {
    this._archiveService.archivedPias.sort((a, b) => {
      let firstValue = a[this.sortValue];
      let secondValue = b[this.sortValue];
      if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
        firstValue = new Date(a[this.sortValue]);
        secondValue = new Date(b[this.sortValue]);
      }
      if (this.sortValue === 'name' || this.sortValue === 'sector_name') {
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
      this._archiveService.archivedPias.reverse();
    }
  }
}
