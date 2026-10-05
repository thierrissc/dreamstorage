import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'royal' | 'cream' | 'glass' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type" 
      [disabled]="disabled || loading" 
      [class]="'ui-btn ui-btn-' + variant + ' ui-btn-' + size + (loading ? ' is-loading' : '')"
    >
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .ui-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: var(--font-heading);
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      border: 1px solid transparent;
      outline: none;
      transition: all var(--transition-fast);
      text-decoration: none;
      white-space: nowrap;
      user-select: none;
      box-sizing: border-box;
    }
    .ui-btn:focus-visible {
      box-shadow: 0 0 0 3px rgba(74, 124, 245, 0.4);
    }
    .ui-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Sizes */
    .ui-btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
      border-radius: 8px;
    }
    .ui-btn-md {
      padding: 10px 18px;
      font-size: 0.9rem;
      border-radius: 12px;
    }
    .ui-btn-lg {
      padding: 12px 24px;
      font-size: 1rem;
      border-radius: 14px;
    }
    .ui-btn-icon {
      width: 38px;
      height: 38px;
      padding: 0;
      border-radius: 10px;
    }

    /* Variants */
    .ui-btn-royal {
      background: linear-gradient(135deg, var(--royal-500) 0%, var(--royal-700) 100%);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 16px rgba(48, 98, 234, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3);
    }
    .ui-btn-royal:hover {
      background: linear-gradient(135deg, var(--royal-400) 0%, var(--royal-600) 100%);
      box-shadow: 0 6px 20px rgba(48, 98, 234, 0.5);
      transform: translateY(-1px);
    }

    .ui-btn-cream {
      background: linear-gradient(135deg, var(--cream-100) 0%, var(--cream-300) 100%);
      color: var(--royal-950);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 14px rgba(222, 205, 169, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.7);
    }
    .ui-btn-cream:hover {
      background: linear-gradient(135deg, var(--cream-50) 0%, var(--cream-200) 100%);
      box-shadow: 0 6px 20px rgba(222, 205, 169, 0.42);
      transform: translateY(-1px);
    }

    .ui-btn-glass {
      background: rgba(16, 33, 84, 0.55);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: var(--cream-200);
      border-color: var(--glass-border);
    }
    .ui-btn-glass:hover {
      background: rgba(22, 45, 111, 0.75);
      color: var(--cream-50);
      border-color: var(--glass-border-bright);
      transform: translateY(-1px);
    }

    .ui-btn-danger {
      background: linear-gradient(135deg, var(--rose-500) 0%, #be123c 100%);
      color: white;
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3);
    }
    .ui-btn-danger:hover {
      background: linear-gradient(135deg, var(--rose-400) 0%, #e11d48 100%);
      box-shadow: 0 6px 18px rgba(244, 63, 94, 0.45);
      transform: translateY(-1px);
    }

    .ui-btn-success {
      background: linear-gradient(135deg, var(--emerald-500) 0%, #047857 100%);
      color: white;
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    .ui-btn-success:hover {
      background: linear-gradient(135deg, var(--emerald-400) 0%, #059669 100%);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
      transform: translateY(-1px);
    }

    .ui-btn-outline {
      background: transparent;
      color: var(--cream-200);
      border-color: var(--glass-border);
    }
    .ui-btn-outline:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--cream-50);
      border-color: var(--glass-border-bright);
    }

    .ui-btn-ghost {
      background: transparent;
      color: var(--cream-300);
      border-color: transparent;
    }
    .ui-btn-ghost:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--cream-50);
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'royal';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
}
