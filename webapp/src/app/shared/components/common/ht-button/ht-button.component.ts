import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonType = 'button' | 'submit' | 'reset';
export type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'help';

/**
 * Reusable Button Component
 * Usage: <ht-button label="Save" (onClick)="handleSave()" severity="primary"></ht-button>
 */
@Component({
  selector: 'ht-button',
  templateUrl: './ht-button.component.html',
  styleUrls: ['./ht-button.component.css']
})
export class HtButtonComponent {
  @Input() label: string = '';
  @Input() type: ButtonType = 'button';
  @Input() severity: ButtonSeverity = 'primary';
  @Input() icon?: string; // PrimeIcons class
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() outlined: boolean = false;
  @Input() rounded: boolean = false;
  @Input() text: boolean = false;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';
  @Input() fullWidth: boolean = false;
  
  @Output() onClick = new EventEmitter<Event>();

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
