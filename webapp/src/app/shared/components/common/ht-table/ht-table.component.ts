import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  template?: TemplateRef<any> | ((row: any) => string);
}

export interface TableAction {
  icon: string;
  label?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  tooltip?: string;
  visible?: (row: any) => boolean;
  handler: (row: any) => void;
}

/**
 * Reusable Table Component with search, filter, pagination
 * Usage:
 * <ht-table 
 *   [data]="goals" 
 *   [columns]="columns" 
 *   [actions]="actions"
 *   [searchable]="true"
 *   (onRowSelect)="handleRowSelect($event)">
 * </ht-table>
 */
@Component({
  selector: 'ht-table',
  templateUrl: './ht-table.component.html',
  styleUrls: ['./ht-table.component.css']
})
export class HtTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Input() searchable: boolean = true;
  @Input() searchPlaceholder: string = 'Search...';
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() emptyMessage: string = 'No records found';
  @Input() showGridlines: boolean = true;
  @Input() stripedRows: boolean = true;
  @Input() responsiveLayout: 'scroll' | 'stack' = 'scroll';
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = '400px';

  @Output() onRowSelect = new EventEmitter<any>();
  @Output() onRowUnselect = new EventEmitter<any>();

  selectedRows: any[] = [];
  searchText: string = '';
  filteredData: any[] = [];

  ngOnInit() {
    this.filteredData = [...this.data];
  }

  ngOnChanges() {
    this.applySearch();
  }

  applySearch() {
    if (!this.searchText) {
      this.filteredData = [...this.data];
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredData = this.data.filter(item => {
      return this.columns.some(col => {
        const value = this.getNestedValue(item, col.field);
        return value?.toString().toLowerCase().includes(searchLower);
      });
    });
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  handleRowSelect(event: any) {
    this.onRowSelect.emit(event.data);
  }

  handleRowUnselect(event: any) {
    this.onRowUnselect.emit(event.data);
  }
}
