import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toastService.toasts().length > 0">
      <div 
        *ngFor="let t of toastService.toasts()" 
        class="toast"
        [ngClass]="'toast-' + t.type"
        (click)="toastService.remove(t.id)"
      >
        <div class="toast-icon">
          <svg *ngIf="t.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="t.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg *ngIf="t.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg *ngIf="t.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="toast-content">
          <div *ngIf="t.title" class="toast-title">{{ t.title }}</div>
          <div class="toast-message">{{ t.message }}</div>
        </div>
        <button class="toast-close" (click)="toastService.remove(t.id); $event.stopPropagation()">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 320px;
      max-width: 440px;
      padding: 14px 18px;
      background: rgba(10, 20, 52, 0.94);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(235, 224, 198, 0.22);
      border-radius: 14px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(48, 98, 234, 0.2);
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }
    .toast:hover {
      transform: translateY(-2px);
      border-color: rgba(251, 247, 238, 0.4);
    }
    .toast-success { border-left: 4px solid #10b981; }
    .toast-error { border-left: 4px solid #f43f5e; }
    .toast-warning { border-left: 4px solid #f59e0b; }
    .toast-info { border-left: 4px solid #38bdf8; }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-weight: 700;
      font-size: 0.88rem;
      color: var(--cream-50);
      margin-bottom: 2px;
    }
    .toast-message {
      font-size: 0.84rem;
      color: var(--cream-200);
      line-height: 1.4;
    }
    .toast-close {
      background: none;
      border: none;
      color: rgba(251, 247, 238, 0.5);
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
    }
    .toast-close:hover {
      color: #fff;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
