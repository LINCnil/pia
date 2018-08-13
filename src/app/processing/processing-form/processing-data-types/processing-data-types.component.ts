import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProcessingDataTypeModel } from '@api/models';
import { ProcessingDataTypeApi } from '@api/services';

@Component({
  selector: 'app-processing-data-types',
  templateUrl: './processing-data-types.component.html',
  styleUrls: ['./processing-data-types.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProcessingDataTypesComponent),
      multi: true
    }
  ]
})

export class ProcessingDataTypesComponent implements ControlValueAccessor {
  public identification: Field = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public personal: Field       = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public professional: Field   = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public financial: Field      = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public log: Field            = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public location: Field       = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public internet: Field       = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  public other: Field          = {enabled: false, processingDataType: new ProcessingDataTypeModel()};
  @Input() processingId: number;


  constructor(private processingDataTypeApi: ProcessingDataTypeApi) { }

  /**
   * Update model value from form control value
   *
   * @param reference
   * @param field
   * @param value
   */
  updateValue(reference: string, enable: boolean = false): void {
    const type = this[reference].processingDataType;

    // Data type enabled no creation yet
    if (enable) {
      // Disabling
      if (type.id) {
        // Delete from server
        this.processingDataTypeApi.delete(type).subscribe(() => {
          // Clear model
          this[reference].processingDataType = new ProcessingDataTypeModel();
        });
      }

      return;
    }

    // Create new
    if (!type.id) {
      // Set missing properties
      type.processing_id = this.processingId;
      type.reference = reference;
      // Create on server
      this.processingDataTypeApi.create(type).subscribe((theType: ProcessingDataTypeModel) => {
        // Udate model
        this[reference].processingDataType = theType;
      });

      return;
    }

    // Update existing on server
    this.processingDataTypeApi.get(type.id).subscribe(pdt => {
      const thePdt = Object.assign(pdt, type); // Fix missing .toJson method because « type » var is not of type ProcessingDataTypeModel
      this.processingDataTypeApi.update(thePdt).subscribe((theType: ProcessingDataTypeModel) => {
        // update model
        this[reference].processingDataType = theType;
      });
    });
  }

  /**
   * Write form control value
   *
   * @param element
   */
  writeValue(value: any): void {
    if (value) {
      value.forEach((type: ProcessingDataTypeModel) => {
        this[type.reference].enabled = true;
        this[type.reference].processingDataType = type;
      });
    }
  }

  /**
   * Register onChange callback
   *
   * @param fn
   */
  registerOnChange(fn: any): void {
  }

  /**
   * Register onTouched callback
   *
   * @param fn
  */
  registerOnTouched(fn: any): void {
  }

  /**
   * Set disabled state of form control
   *
   * @param isDisabled
   */
  setDisabledState?(isDisabled: boolean): void {
  }
}

interface Field {
  enabled: boolean;
  processingDataType: ProcessingDataTypeModel
}
