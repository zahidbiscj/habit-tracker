import { Component, Input } from '@angular/core';

/**
 * Reusable Card Component
 * Usage: 
 * <ht-card title="Goal Details" [showActions]="true">
 *   <ng-template #cardActions>
 *     <ht-button label="Edit" icon="pi pi-pencil"></ht-button>
 *   </ng-template>
 *   <p>Card content goes here</p>
 * </ht-card>
 */
@Component({
  selector: 'ht-card',
  templateUrl: './ht-card.component.html',
  styleUrls: ['./ht-card.component.css']
})
export class HtCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() showActions: boolean = false;
  @Input() loading: boolean = false;
  @Input() elevated: boolean = true;
}
