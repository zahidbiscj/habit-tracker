import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Reusable Checkbox Component
 * Usage: <ht-checkbox [(ngModel)]="agreed" label="I agree to terms"></ht-checkbox>
 */
@Component({
  selector: 'ht-checkbox',
  templateUrl: './ht-checkbox.component.html',
  styleUrls: ['./ht-checkbox.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtCheckboxComponent),
      multi: true
    }
  ]
})
export class HtCheckboxComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() binary: boolean = true;
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = '';
  @Input() value: any; // Value to bind when used in array context

  internalValue: any = false;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (Array.isArray(value) && this.value) {
      // Array mode: check if our value is in the array
      this.internalValue = value.includes(this.value);
    } else {
      // Binary mode
      this.internalValue = !!value;
    }
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

  onValueChange(checked: boolean): void {
    this.internalValue = checked;
    
    if (this.value) {
      // Array mode: emit the value to be added/removed
      this.onChange({ value: this.value, checked });
    } else {
      // Binary mode: emit boolean
      this.onChange(checked);
    }
    this.onTouched();
  }
}
