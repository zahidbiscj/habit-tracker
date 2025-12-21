import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Reusable Modal/Dialog Component
 * Usage:
 * <ht-modal [(visible)]="showModal" header="Edit Goal" (onClose)="handleClose()">
 *   <p>Modal content here</p>
 * </ht-modal>
 */
@Component({
  selector: 'ht-modal',
  templateUrl: './ht-modal.component.html',
  styleUrls: ['./ht-modal.component.css']
})
export class HtModalComponent {
  @Input() visible: boolean = false;
  @Input() header: string = '';
  @Input() modal: boolean = true;
  @Input() closable: boolean = true;
  @Input() draggable: boolean = false;
  @Input() resizable: boolean = false;
  @Input() width: string = '90vw';
  @Input() maxWidth: string = '600px';
  @Input() showFooter: boolean = false;
  @Input() position: 'center' | 'top' | 'bottom' | 'left' | 'right' = 'center';
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onShow = new EventEmitter<void>();

  handleClose() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
  }

  handleShow() {
    this.onShow.emit();
  }
}
