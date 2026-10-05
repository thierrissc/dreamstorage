import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-card liquid-glass-card" [class.hoverable]="hoverable">
      <ng-content select="ui-card-header, [card-header]"></ng-content>
      <div class="ui-card-content">
        <ng-content></ng-content>
      </div>
      <ng-content select="ui-card-footer, [card-footer]"></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ui-card {
      padding: 24px;
    }
    .ui-card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class CardComponent {
  @Input() hoverable = true;
}
