import { Component, OnInit } from '@angular/core';
import { PiaApi, ProcessingApi } from '@api/services';
import { ActivatedRoute } from '@angular/router';
import { PiaModel, ProcessingModel } from '@api/models';
import { ModalsService } from '../../modals/modals.service';
import { PiaService } from '../../entry/pia.service';

@Component({
  selector: 'app-pias-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class PiasListComponent implements OnInit {

  public processing: ProcessingModel = new ProcessingModel()
  public pias: Array<PiaModel> = []
  sortOrder: string
  sortValue: string

  constructor(
    private route: ActivatedRoute,
    private piaApi: PiaApi,
    private processingApi: ProcessingApi,
    private _piaService: PiaService,
    protected _modalsService: ModalsService
  ) {
    this.processing = this.route.snapshot.data.processing;
    this._piaService.currentProcessing = this.processing;
    this.route.params.subscribe( params => {
      this.piaApi.getAll({'processing' : params.id}).subscribe((pias: Array<PiaModel>) => {
        this.pias = pias;
      });
    });
  }

  ngOnInit() {}

  sortBy(fieldToSort: string) {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sortPia();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Define how to sort the list.
   * @private
   * @memberof CardsComponent
   */
  protected sortPia() {
    this.pias.sort((a, b) => {
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
      this.pias.reverse();
    }
  }
}
