import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-wrapper">
      <nav class="nav-list">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <span class="nav-text">Visão Geral</span>
        </a>

        <a routerLink="/produtos" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <span class="nav-text">Produtos & Estoque</span>
          <span class="nav-counter">{{ inventoryService.products().length }}</span>
        </a>

        <a routerLink="/movimentacoes" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </div>
          <span class="nav-text">Movimentações</span>
        </a>

        <a routerLink="/categorias" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <span class="nav-text">Categorias & Fornecedores</span>
        </a>

        <a routerLink="/perfil" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span class="nav-text">Perfil & Controle</span>
        </a>
      </nav>

      <!-- Storage Quick Health Card -->
      <div class="health-card">
        <div class="health-header">
          <span class="health-title">Saúde do Armazém</span>
          <span class="health-badge">{{ healthRate() }}%</span>
        </div>
        <div class="health-bar-bg">
          <div class="health-bar-fill" [style.width.%]="healthRate()"></div>
        </div>
        <div class="health-footer">
          <span>{{ healthyItems() }} normais</span>
          <span class="health-warn">{{ criticalItems() }} críticos</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      width: 260px;
      min-height: calc(100vh - 67px);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: rgba(8, 16, 42, 0.45);
      border-right: 1px solid rgba(235, 224, 198, 0.1);
    }
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 14px;
      color: var(--cream-200);
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid transparent;
      position: relative;
    }
    .nav-item:hover {
      background: rgba(16, 33, 84, 0.6);
      color: var(--cream-50);
      border-color: rgba(235, 224, 198, 0.15);
      transform: translateX(3px);
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(37, 77, 191, 0.35) 0%, rgba(16, 33, 84, 0.6) 100%);
      color: #ffffff;
      border-color: rgba(74, 124, 245, 0.4);
      box-shadow: 0 4px 20px rgba(48, 98, 234, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2);
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 25%;
      bottom: 25%;
      width: 4px;
      border-radius: 0 4px 4px 0;
      background: var(--cream-300);
      box-shadow: 0 0 10px var(--cream-300);
    }
    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.85;
    }
    .nav-item.active .nav-icon {
      opacity: 1;
      color: var(--cream-200);
    }
    .nav-text {
      flex: 1;
    }
    .nav-counter {
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--cream-300);
      font-weight: 700;
    }

    /* Health Card */
    .health-card {
      background: rgba(12, 25, 68, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(235, 224, 198, 0.14);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .health-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .health-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--cream-200);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .health-badge {
      font-size: 0.82rem;
      font-weight: 800;
      color: #34d399;
      font-family: var(--font-heading);
    }
    .health-bar-bg {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }
    .health-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      border-radius: 999px;
      transition: width 0.4s ease;
    }
    .health-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: rgba(235, 224, 198, 0.55);
    }
    .health-warn {
      color: #fbbf24;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .sidebar-wrapper {
        width: 100%;
        min-height: auto;
        border-right: none;
        border-bottom: 1px solid rgba(235, 224, 198, 0.1);
        padding: 12px;
      }
      .nav-list {
        flex-direction: row;
        overflow-x: auto;
      }
      .health-card {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {
  inventoryService = inject(InventoryService);

  healthyItems() {
    return this.inventoryService.dashboardData()?.summary.healthy_stock_count || 0;
  }

  criticalItems() {
    const s = this.inventoryService.dashboardData()?.summary;
    return (s?.low_stock_count || 0) + (s?.out_of_stock_count || 0);
  }

  healthRate() {
    const total = this.inventoryService.products().length;
    if (!total) return 100;
    const healthy = this.healthyItems();
    return Math.round((healthy / total) * 100);
  }
}
