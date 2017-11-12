import { CommonModule, DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressBarModule
} from '@angular/material';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const materialModules = [
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: materialModules,
  exports: materialModules
})
export class MaterialModule {}
