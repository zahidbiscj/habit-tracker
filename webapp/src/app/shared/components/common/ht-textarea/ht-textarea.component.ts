import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Reusable Textarea Component
 * Usage: <ht-textarea [(ngModel)]="value" label="Description" [rows]="4"></ht-textarea>
 */
@Component({
  selector: 'ht-textarea',
  templateUrl: './ht-textarea.component.html',
  styleUrls: ['./ht-textarea.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtTextareaComponent),
      multi: true
    }
  ]
})
export class HtTextareaComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() rows: number = 3;
  @Input() maxLength?: number;
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() autoResize: boolean = false;

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
