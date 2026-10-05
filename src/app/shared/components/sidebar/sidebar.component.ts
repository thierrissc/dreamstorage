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
      width: 240px;
      min-height: calc(100vh - 55px);
      padding: 20px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-subtle);
    }
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: rgba(37, 99, 235, 0.12);
      color: var(--royal-300);
      border-color: rgba(37, 99, 235, 0.25);
    }
    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.85;
    }
    .nav-item.active .nav-icon {
      opacity: 1;
      color: var(--royal-400);
    }
    .nav-text {
      flex: 1;
    }
    .nav-counter {
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-secondary);
      font-weight: 600;
    }

    /* Health Card */
    .health-card {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .health-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .health-title {
      font-size: 0.74rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .health-badge {
      font-size: 0.8rem;
      font-weight: 600;
      color: #34d399;
      font-family: var(--font-sans);
    }
    .health-bar-bg {
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .health-bar-fill {
      height: 100%;
      background: #10b981;
      border-radius: 999px;
      transition: width 0.3s ease;
    }
    .health-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--text-muted);
    }
    .health-warn {
      color: #fbbf24;
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
