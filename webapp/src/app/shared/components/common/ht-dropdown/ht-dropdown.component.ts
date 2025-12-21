import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

/**
 * Reusable Dropdown Component
 * Usage: <ht-dropdown [(ngModel)]="selectedValue" [options]="options" label="Select User"></ht-dropdown>
 */
@Component({
  selector: 'ht-dropdown',
  templateUrl: './ht-dropdown.component.html',
  styleUrls: ['./ht-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtDropdownComponent),
      multi: true
    }
  ]
})
export class HtDropdownComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() options: DropdownOption[] = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showClear: boolean = true;
  @Input() filter: boolean = false;
  @Input() filterPlaceholder: string = 'Search...';
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';

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
