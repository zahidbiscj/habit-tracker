import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private messageService: MessageService) {}

  success(detail: string, summary: string = 'Success') {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  error(detail: string, summary: string = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  warn(detail: string, summary: string = 'Warning') {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  info(detail: string, summary: string = 'Info') {
    this.messageService.add({ severity: 'info', summary, detail });
  }

  /**
   * Auto-choose severity based on message content keywords.
   * Fallback to info.
   */
  auto(detail: string) {
    const d = (detail || '').toLowerCase();
    if (/[✅]|success/.test(d)) return this.success(detail);
    if (/[❌]|failed|error/.test(d)) return this.error(detail);
    if (/[⚠️]|warning|warn/.test(d)) return this.warn(detail);
    return this.info(detail);
  }
}
