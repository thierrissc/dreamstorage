import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'normal' | 'low' | 'out' | 'category' | 'cream' | 'neutral';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="ui-badge" [ngClass]="'badge-' + variant">
      <span *ngIf="dot" class="badge-dot"></span>
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    .ui-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      white-space: nowrap;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .badge-normal {
      background: rgba(16, 185, 129, 0.16);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .badge-low {
      background: rgba(245, 158, 11, 0.16);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .badge-out {
      background: rgba(244, 63, 94, 0.18);
      color: #fb7185;
      border: 1px solid rgba(251, 113, 133, 0.35);
    }
    .badge-category {
      background: rgba(48, 98, 234, 0.18);
      color: var(--royal-200);
      border: 1px solid rgba(74, 124, 245, 0.3);
    }
    .badge-cream {
      background: rgba(203, 180, 137, 0.15);
      color: var(--cream-200);
      border: 1px solid rgba(203, 180, 137, 0.3);
    }
    .badge-neutral {
      background: rgba(255, 255, 255, 0.08);
      color: var(--cream-300);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'normal';
  @Input() dot = false;
}
