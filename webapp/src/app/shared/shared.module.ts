import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

// Custom Reusable Components (now standalone)
import { HtInputComponent } from './components/common/ht-input/ht-input.component';
import { HtTextareaComponent } from './components/common/ht-textarea/ht-textarea.component';
import { HtDropdownComponent } from './components/common/ht-dropdown/ht-dropdown.component';
import { HtDatepickerComponent } from './components/common/ht-datepicker/ht-datepicker.component';
import { HtButtonComponent } from './components/common/ht-button/ht-button.component';
import { HtTableComponent } from './components/common/ht-table/ht-table.component';
import { HtCardComponent } from './components/common/ht-card/ht-card.component';
import { HtModalComponent } from './components/common/ht-modal/ht-modal.component';
import { HtCheckboxComponent } from './components/common/ht-checkbox/ht-checkbox.component';

const COMPONENTS = [
  HtInputComponent,
  HtTextareaComponent,
  HtDropdownComponent,
  HtDatepickerComponent,
  HtButtonComponent,
  HtTableComponent,
  HtCardComponent,
  HtModalComponent,
  HtCheckboxComponent
];

const PRIMENG_MODULES = [
  InputTextModule,
  InputTextareaModule,
  ButtonModule,
  DropdownModule,
  CalendarModule,
  TableModule,
  DialogModule,
  CheckboxModule,
  TooltipModule
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...PRIMENG_MODULES,
    ...COMPONENTS
  ]
})
export class SharedModule { }
