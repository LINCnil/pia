import { Component,Input, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalsComponent } from '../../../modals/modals.component';
import { Router } from '@angular/router';
import {Measure} from './measure.model';

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss']
})
export class MeasuresComponent implements OnInit {

  @Input() measures: Measure;
  @Input() item: any;
  @Input() pia: any;
  measureForm: FormGroup;
  modal = new ModalsComponent(this.router);

  constructor(private el: ElementRef, private router: Router) {
    this.router = router;
  }

  ngOnInit() {
    this.measureForm = new FormGroup({
      measureTitle: new FormControl(),
      measureContent: new FormControl()
    });
  }

  /**
   * Disables title field when losing focus from it.
   * Shows measure edit button.
   * Saves data from title field.
   * @param {event} event any event.
   */
  measureTitleFocusOut(event) {
    const currentMeasureTitle = event.target || event.srcElement || event.currentTarget;
    const currentMeasureID = currentMeasureTitle.getAttribute('data-id');
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(()=>{
      if (titleValue && titleValue.length > 0 && document.activeElement.id != 'pia-measure-content-' + currentMeasureID) {
        this.showEditButton();
        this.measureForm.controls['measureTitle'].disable();
        // Disables content field if both fields are filled and content isn't the next targeted element.
        if (contentValue && contentValue.length > 0) {
          this.measureForm.controls['measureContent'].disable();
        }
        // TODO : save data
      }
      // Disables content field too if no title and content is filled and isn't the next targeted element.
      if (!titleValue && contentValue && contentValue.length > 0 && document.activeElement.id != 'pia-measure-content') {
        this.showEditButton();
        this.measureForm.controls['measureContent'].disable();
      }
    },1);
  }

  /**
   * Disables content field when losing focus from it.
   * Shows measure edit button.
   * Saves data from content field.
   * @param {event} event any event.
   */
  measureContentFocusOut(event) {
    const currentMeasureContent = event.target || event.srcElement || event.currentTarget;
    const currentMeasureID = currentMeasureContent.getAttribute('data-id');
    const titleValue = this.measureForm.value.measureTitle;
    const contentValue = this.measureForm.value.measureContent;

    // Waiting for document.activeElement update
    setTimeout(()=>{
      if (contentValue && contentValue.length > 0 && document.activeElement.id != 'pia-measure-title-' +currentMeasureID) {
        this.showEditButton();
        this.measureForm.controls['measureContent'].disable();
        // Disables title field if both fields are filled and title isn't the next targeted element.
        if (titleValue && titleValue.length > 0) {
          this.measureForm.controls['measureTitle'].disable();
        }
        // TODO : save data
      }
      // Disables content field too if no title and content is filled and isn't the next targeted element.
      if (!contentValue && contentValue && titleValue.length > 0 && document.activeElement.id != 'pia-measure-title') {
        this.showEditButton();
        this.measureForm.controls['measureTitle'].disable();
      }
    },1);
  }

  /* TODO : method onFormUpdate() to show/hide trash button */

  /**
   * Enables or disables edition mode (fields) for measures.
   */
  activateMeasureEdition() {
    this.hideEditButton();
    this.measureForm.enable();
  }

  /**
   * Shows or hides a measure.
   */
  displayMeasure() {
    const accordeon = this.el.nativeElement.querySelector('.pia-measureBlock-title button span');
    accordeon.classList.toggle('pia-icon-accordeon-down');
    const displayer = this.el.nativeElement.querySelector('.pia-measureBlock-displayer');
    displayer.classList.toggle('close');
  }

  /**
   * Allows an user to remove a measure.
   */
  removeMeasure(measureID: string) {
    const measuresCount = document.querySelectorAll('.pia-measureBlock');
    if (measuresCount && measuresCount.length <= 1) {
      this.modal.openModal('not-enough-measures-to-remove');
    } else {
      localStorage.setItem('measure-id', measureID);
      this.modal.openModal('remove-measure');
    }
  }

  /**
   * Shows measure edit button.
   */
  showEditButton() {
    const editBtn = this.el.nativeElement.querySelector('.pia-measureBlock-edit');
    editBtn.classList.remove('hide');
  }

  /**
   * Hides measure edit button.
   */
  hideEditButton() {
    const editBtn = this.el.nativeElement.querySelector('.pia-measureBlock-edit');
    editBtn.classList.add('hide');
  }

  /**
   * Shows measure delete button.
   */
  /*showDeleteButton() {
    const deleteBtn = this.el.nativeElement.querySelector('.pia-measureBlock-delete');
    deleteBtn.classList.remove('hide');
  }*/

  /**
   * Hides measure delete button.
   */
  /*hideDeleteButton() {
    const deleteBtn = this.el.nativeElement.querySelector('.pia-measureBlock-delete');
    deleteBtn.classList.add('hide');
  }*/

}
