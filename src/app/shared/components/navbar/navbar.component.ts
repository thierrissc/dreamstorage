import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Web3Service } from '../../../core/services/web3.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="navbar-wrapper">
      <div class="navbar-container">
        <a routerLink="/" class="brand-link">
          <div class="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Dream<span class="brand-accent">Storage</span></span>
            <span class="brand-tag">INVENTORY CORE 3.0</span>
          </div>
        </a>

        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="onSearch()"
            placeholder="Pesquisar por SKU, produto ou prateleira..."
            class="search-input"
          />
          <span class="search-shortcut">Enter</span>
        </div>

        <div class="nav-actions">
          <button 
            type="button"
            class="web3-wallet-btn" 
            [class.connected]="web3Service.isConnected()"
            (click)="handleWalletAction()"
            title="Conectar Carteira Web3 para Auditoria Criptográfica"
          >
            <span class="web3-pulse-dot" *ngIf="web3Service.isConnected()"></span>
            <svg *ngIf="!web3Service.isConnected()" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="17" cy="12" r="2"></circle>
              <path d="M6 12h.01M10 12h.01"></path>
            </svg>
            <span class="font-mono">{{ web3Service.isConnected() ? web3Service.getShortAddress() : 'Conectar Web3' }}</span>
          </button>

          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-label">Sistema Ativo</span>
          </div>

          <div class="alerts-dropdown-wrapper">
            <button 
              class="icon-btn" 
              (click)="toggleAlerts()" 
              [class.active]="showAlerts()"
              title="Alertas de Estoque"
              aria-label="Alertas de Estoque"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span *ngIf="unreadAlertsCount() > 0" class="alerts-badge">
                {{ unreadAlertsCount() }}
              </span>
            </button>

            <div *ngIf="showAlerts()" class="alerts-dropdown-menu">
              <div class="alerts-header">
                <div class="alerts-title-box">
                  <span class="alerts-title">Alertas de Reposição</span>
                  <span class="badge badge-low">{{ unreadAlertsCount() }} críticos</span>
                </div>
                <button class="btn-text-cream" (click)="markAllAsRead()">Marcar todos</button>
              </div>

              <div class="alerts-list">
                <div *ngIf="inventoryService.alerts().length === 0" class="alerts-empty">
                  Nenhum alerta pendente no momento.
                </div>
                <div 
                  *ngFor="let alert of inventoryService.alerts()" 
                  class="alert-item"
                  [class.alert-out]="alert.alert_type === 'OUT_OF_STOCK'"
                >
                  <div class="alert-item-content">
                    <div class="alert-item-title">{{ alert.product_name }}</div>
                    <div class="alert-item-sub">
                      <span class="sku-tag">{{ alert.product_sku }}</span>
                      <span class="alert-qty">Saldo atual: {{ alert.current_quantity }} (Min: {{ alert.min_stock }})</span>
                    </div>
                  </div>
                  <button class="alert-dismiss" (click)="dismissAlert(alert.id)" title="Dispensar" aria-label="Dispensar alerta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="alerts-footer">
                <a routerLink="/produtos" (click)="showAlerts.set(false)" class="alerts-view-all">
                  <span>Ver todos os produtos no inventário</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <a routerLink="/perfil" class="user-chip" title="Gerenciar Perfil e Segurança">
            <div class="avatar-cream">
              {{ authService.currentUser().username.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser().first_name || authService.currentUser().username }}</span>
              <span class="user-role">Super Admin</span>
            </div>
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 500;
      background: rgba(11, 20, 44, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .navbar-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon-box {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--royal-500) 0%, var(--royal-600) 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-size: 1.18rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--cream-50);
      line-height: 1.1;
    }
    .brand-accent {
      color: var(--royal-300);
    }
    .brand-tag {
      font-size: 0.62rem;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 380px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--cream-400);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 8px 64px 8px 36px;
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 0.84rem;
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    .search-input:focus {
      border-color: var(--royal-400);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .search-shortcut {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.68rem;
      color: var(--cream-muted);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: var(--radius-xs);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .web3-wallet-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(147, 51, 234, 0.14);
      border: 1px solid rgba(192, 132, 252, 0.35);
      color: #e9d5ff;
      padding: 6px 14px;
      border-radius: var(--radius-pill);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .web3-wallet-btn:hover {
      background: rgba(147, 51, 234, 0.25);
      border-color: rgba(192, 132, 252, 0.65);
      color: #ffffff;
    }
    .web3-wallet-btn.connected {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.35);
      color: #a7f3d0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .status-label {
      font-size: 0.74rem;
      color: var(--cream-300);
      font-weight: 600;
    }

    .alerts-dropdown-wrapper {
      position: relative;
    }
    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      color: var(--cream-300);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
    }
    .icon-btn:hover, .icon-btn.active {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border-color: var(--border-medium);
    }
    .alerts-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: var(--radius-pill);
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
    }

    .alerts-dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 340px;
      background: var(--bg-card-solid);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: 600;
    }
    .alerts-header {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
    }
    .alerts-title-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alerts-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--cream-50);
    }
    .btn-text-cream {
      background: none;
      border: none;
      font-size: 0.74rem;
      color: var(--royal-300);
      cursor: pointer;
      font-weight: 600;
    }
    .btn-text-cream:hover {
      color: #ffffff;
    }

    .alerts-list {
      max-height: 280px;
      overflow-y: auto;
    }
    .alerts-empty {
      padding: 24px 16px;
      text-align: center;
      font-size: 0.82rem;
      color: var(--cream-muted);
    }
    .alert-item {
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1px solid rgba(235, 224, 198, 0.05);
      transition: background var(--transition-fast);
    }
    .alert-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .alert-item-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .alert-item-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--cream-50);
    }
    .alert-item-sub {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .alert-qty {
      font-size: 0.72rem;
      color: var(--cream-300);
    }
    .alert-dismiss {
      background: none;
      border: none;
      color: var(--cream-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-xs);
    }
    .alert-dismiss:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .alerts-footer {
      padding: 10px 14px;
      text-align: center;
      border-top: 1px solid var(--border-subtle);
      background: rgba(5, 10, 24, 0.5);
    }
    .alerts-view-all {
      font-size: 0.78rem;
      color: var(--royal-300);
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .alerts-view-all:hover {
      color: #ffffff;
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 10px 3px 3px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .user-chip:hover {
      border-color: var(--border-medium);
      background: rgba(255, 255, 255, 0.06);
    }
    .avatar-cream {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cream-100) 0%, var(--cream-200) 100%);
      color: #0b142c;
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px rgba(238, 232, 218, 0.3);
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--cream-50);
      line-height: 1.1;
    }
    .user-role {
      font-size: 0.65rem;
      color: var(--cream-muted);
    }

    @media (max-width: 900px) {
      .search-box {
        display: none;
      }
      .status-indicator {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  inventoryService = inject(InventoryService);
  authService = inject(AuthService);
  toast = inject(ToastService);
  web3Service = inject(Web3Service);
  router = inject(Router);

  searchQuery = '';
  showAlerts = signal<boolean>(false);

  unreadAlertsCount(): number {
    return this.inventoryService.alerts().length;
  }

  toggleAlerts(): void {
    this.showAlerts.update(v => !v);
  }

  async handleWalletAction(): Promise<void> {
    if (this.web3Service.isConnected()) {
      this.toast.info(`Carteira conectada: ${this.web3Service.getShortAddress()}`);
      return;
    }
    try {
      const addr = await this.web3Service.connectWallet();
      this.toast.success(`Carteira Web3 conectada: ${this.web3Service.getShortAddress(addr)}`);
    } catch (err: any) {
      this.toast.error(err.message || 'Erro ao conectar carteira Web3');
    }
  }

  dismissAlert(id: number): void {
    this.inventoryService.markAlertRead(id).subscribe(() => {
      this.toast.info('Alerta arquivado');
    });
  }

  markAllAsRead(): void {
    const list = [...this.inventoryService.alerts()];
    list.forEach(a => this.inventoryService.markAlertRead(a.id).subscribe());
    this.showAlerts.set(false);
    this.toast.success('Todos os alertas foram marcados como lidos');
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/produtos'], { queryParams: { q: this.searchQuery } });
    }
  }
}
