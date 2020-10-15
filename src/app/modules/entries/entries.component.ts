import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Pia } from 'src/app/models/pia.model';
import { IntrojsService } from 'src/app/services/introjs.service';
import { ModalsService } from 'src/app/services/modals.service';
import { PiaService } from 'src/app/services/pia.service';


@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss']
})
export class EntriesComponent implements OnInit, OnDestroy {
  @Input() pia: any;
  newPia: Pia;
  piaForm: FormGroup;
  importPiaForm: FormGroup;
  sortOrder: string;
  sortValue: string;
  viewStyle: { view: string } = { view: 'card'};
  view: 'card';
  paramsSubscribe: Subscription;
  searchText: string;

  constructor(
    private router: Router,
    private el: ElementRef,
    public modalsService: ModalsService,
    public piaService: PiaService) { }

  ngOnInit(): void {

    // PREPARE ORDER
    this.sortOrder = localStorage.getItem('sortOrder');
    this.sortValue = localStorage.getItem('sortValue');
    if (!this.sortOrder || !this.sortValue) {
      this.sortOrder = 'up';
      this.sortValue = 'updated_at';
      localStorage.setItem('sortOrder', this.sortOrder);
      localStorage.setItem('sortValue', this.sortValue);
    }

    // INIT CONTENT
    this.refreshContent();

    // PREPARE VIEW MODE
    if (localStorage.getItem('homepageDisplayMode') === 'list') {
      this.viewOnList();
    } else {
      this.viewOnCard();
    }

    // INIT IMPORT FORM
    this.importPiaForm = new FormGroup({
      import_file: new FormControl('', [])
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscribe.unsubscribe();
  }



  onCleanSearch(): void {
    this.searchText = '';
  }

  /**
   * Asort items created on PIA.
   * @param fieldToSort - Field to sort.
   */
  sortBy(fieldToSort: string): void {
    this.sortValue = fieldToSort;
    this.sortOrder = this.sortOrder === 'down' ? 'up' : 'down';
    this.sort();
    localStorage.setItem('sortValue', this.sortValue);
    localStorage.setItem('sortOrder', this.sortOrder);
  }

  /**
   * Display elements in list view.
   */
  viewOnList(): void {
    this.viewStyle.view = 'list';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // this.router.navigate(['entries', 'list']);
    this.refreshContent();
  }

  /**
   * Display elements in card view.
   */
  viewOnCard(): void {
    this.viewStyle.view = 'card';
    localStorage.setItem('homepageDisplayMode', this.viewStyle.view);
    // this.router.navigate(['entries', 'card']);
    this.refreshContent();
  }


  /**
   * Refresh the list.
   */
  async refreshContent(): Promise<void> {
    const pia = new Pia();
    setTimeout(async () => {
      await pia.getAllActives().then((data: Array<Pia>) => {
        this.piaService.pias = data;
        this.piaService.calculProgress();
        this.sortOrder = localStorage.getItem('sortOrder');
        this.sortValue = localStorage.getItem('sortValue');
        this.sort();
      });
    }, 200);
  }

  // ONLY FOR PIA FORMS (create, edit)

    /**
     * On PIA change.
     * @param pia - Any PIA.
     */
    piaChange(pia): void {
      if (this.piaService.pias.includes(pia)) {
        this.piaService.pias.forEach(item => {
          if (item.id === pia.id) {
            item = pia;
          }
        });
      } else {
        this.piaService.pias.push(pia);
      }
    }

    /**
     * Creates a new PIA card and adds a flip effect to go switch between new PIA and edit PIA events.
     */
    newPIA(): void {
      this.newPia = new Pia();
      const cardsToSwitch = document.getElementById('cardsSwitch');
      cardsToSwitch.classList.toggle('flipped');
      const rocketToHide = document.getElementById('pia-rocket');
      if (rocketToHide) {
        rocketToHide.style.display = 'none';
      }
    }

    /**
     * Inverse the order of the list.
     */
    reversePIA(): void {
      const cardsToSwitchReverse = document.getElementById('cardsSwitch');
      cardsToSwitchReverse.classList.remove('flipped');
    }

    /**
     * Import a new PIA.
     * @param [event] - Any Event.
     */
    importPia(event?: any): void {
      if (event) {
        this.piaService.import(event.target.files[0]);
      } else {
        this.el.nativeElement.querySelector('#import_file').click();
      }
    }

    /**
     * Go to the new entry route
     * @param id id
     */
    onPiaSubmited(id): void {
      this.router.navigate(['entry', id, 'section', 1, 'item', 1]);
    }

  // END ONLY FOR PIA FORMS

  /**
   * Define how to sort the list.
   */
  private sort(): void {
    this.piaService.pias.sort((a, b) => {
      let firstValue = a[this.sortValue];
      let secondValue = b[this.sortValue];
      if (this.sortValue === 'updated_at' || this.sortValue === 'created_at') {
        firstValue = new Date(a[this.sortValue]);
        secondValue = new Date(b[this.sortValue]);
      }
      if (
        this.sortValue === 'name' ||
        this.sortValue === 'author_name' ||
        this.sortValue === 'evaluator_name' ||
        this.sortValue === 'validator_name'
      ) {
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
      this.piaService.pias.reverse();
    }
  }
}
