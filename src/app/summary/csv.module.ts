import { NgModule } from '@angular/core';
import { CsvComponent } from './csv.component';

@NgModule({
  exports: [CsvComponent],
  declarations: [CsvComponent],
  entryComponents: [CsvComponent],
})
export class CsvModule {}
