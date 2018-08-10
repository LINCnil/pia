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
  public identification: Field = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public personal: Field       = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public professional: Field   = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public financial: Field      = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public log: Field            = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public location: Field       = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public internet: Field       = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
  public other: Field          = {enabled: false, processedDataType: new ProcessingDataTypeModel()};
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
    const type = this[reference].processedDataType;

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
        this[reference].processedDataType = theType;
      });

      return;
    }

    // Update existing on server
    this.processingDataTypeApi.update(type).subscribe((theType: ProcessingDataTypeModel) => {
      // update model
      this[reference].processedDataType = theType;
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
        this[type.reference].processedDataType = type;
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
  processedDataType: ProcessingDataTypeModel
}
