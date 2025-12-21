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

  value: boolean = false;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = !!value;
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
