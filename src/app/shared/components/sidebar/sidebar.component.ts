import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';
import { Web3Service } from '../../../core/services/web3.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-wrapper">
      <nav class="nav-list">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <div class="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <span class="nav-text">Visão Geral & 3D</span>
        </a>

        <a routerLink="/produtos" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </div>
          <span class="nav-text">Movimentações</span>
        </a>

        <a routerLink="/entregas" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <span class="nav-text">Entregas & Rastreio</span>
          <span class="nav-counter" *ngIf="inventoryService.deliveries().length > 0">{{ inventoryService.deliveries().length }}</span>
        </a>

        <a routerLink="/categorias" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <span class="nav-text">Categorias & Fornecedores</span>
        </a>

        <a routerLink="/perfil" routerLinkActive="active" class="nav-item">
          <div class="nav-icon">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span class="nav-text">Perfil & Controle</span>
        </a>
      </nav>

      <div class="sidebar-bottom-panel">
        <div class="health-card">
          <div class="health-header">
            <span class="health-title">Saúde do Armazém</span>
            <span class="health-badge font-mono">{{ healthRate() }}%</span>
          </div>
          <div class="health-bar-bg">
            <div class="health-bar-fill" [style.width.%]="healthRate()"></div>
          </div>
          <div class="health-footer">
            <span>{{ healthyItems() }} normais</span>
            <span class="health-warn">{{ criticalItems() }} críticos</span>
          </div>
        </div>

        <div class="web3-status-box">
          <div class="web3-status-header">
            <span class="web3-pulse-dot"></span>
            <span class="font-mono text-xs">LEDGER WEB3</span>
          </div>
          <span class="web3-status-addr font-mono">{{ web3Service.getShortAddress() }}</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      width: 250px;
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
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--cream-300);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }
    .nav-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: #ffffff;
      border-color: rgba(235, 224, 198, 0.08);
    }
    .nav-item.active {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(20, 40, 102, 0.35) 100%);
      color: #ffffff;
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.2);
    }
    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.85;
    }
    .nav-item.active .nav-icon {
      opacity: 1;
      color: var(--royal-300);
    }
    .nav-text {
      flex: 1;
    }
    .nav-counter {
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      background: rgba(255, 255, 255, 0.06);
      color: var(--cream-200);
      font-weight: 700;
      font-family: var(--font-mono);
    }

    .sidebar-bottom-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .health-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
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
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .health-badge {
      font-size: 0.8rem;
      font-weight: 700;
      color: #34d399;
    }
    .health-bar-bg {
      height: 5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-pill);
      overflow: hidden;
    }
    .health-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
      border-radius: var(--radius-pill);
      transition: width 0.3s ease;
    }
    .health-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: var(--cream-muted);
    }
    .health-warn {
      color: #fbbf24;
    }

    .web3-status-box {
      background: rgba(147, 51, 234, 0.08);
      border: 1px solid rgba(192, 132, 252, 0.22);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .web3-status-header {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #c084fc;
      font-weight: 700;
    }
    .web3-status-addr {
      font-size: 0.74rem;
      color: var(--cream-300);
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
      .sidebar-bottom-panel {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {
  inventoryService = inject(InventoryService);
  web3Service = inject(Web3Service);

  healthyItems(): number {
    return this.inventoryService.dashboardData()?.summary.healthy_stock_count || 0;
  }

  criticalItems(): number {
    const s = this.inventoryService.dashboardData()?.summary;
    return (s?.low_stock_count || 0) + (s?.out_of_stock_count || 0);
  }

  healthRate(): number {
    const total = this.inventoryService.products().length;
    if (!total) return 100;
    const healthy = this.healthyItems();
    return Math.round((healthy / total) * 100);
  }
}
