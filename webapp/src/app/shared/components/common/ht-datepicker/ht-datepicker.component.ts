import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Reusable Date Picker Component
 * Usage: <ht-datepicker [(ngModel)]="selectedDate" label="Start Date"></ht-datepicker>
 */
@Component({
  selector: 'ht-datepicker',
  templateUrl: './ht-datepicker.component.html',
  styleUrls: ['./ht-datepicker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtDatepickerComponent),
      multi: true
    }
  ]
})
export class HtDatepickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select date';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showTime: boolean = false;
  @Input() showIcon: boolean = true;
  @Input() dateFormat: string = 'yy-mm-dd';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() disabledDates?: Date[];
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() selectionMode: 'single' | 'multiple' | 'range' = 'single';

  value: any = null;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}
