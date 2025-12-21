import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Reusable Input Component
 * Wraps PrimeNG InputText with common functionality
 * Usage: <ht-input [(ngModel)]="value" label="Name" [required]="true"></ht-input>
 */
@Component({
  selector: 'ht-input',
  templateUrl: './ht-input.component.html',
  styleUrls: ['./ht-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtInputComponent),
      multi: true
    }
  ]
})
export class HtInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() maxLength?: number;
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() icon?: string; // PrimeIcons class (e.g., 'pi pi-user')
  @Input() iconPosition: 'left' | 'right' = 'left';

  value: any = '';
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value || '';
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
