import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="navbar-wrapper">
      <div class="navbar-container">
        <!-- Logo & Brand -->
        <a routerLink="/" class="brand-link">
          <div class="brand-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">Dream<span class="brand-accent">Storage</span></span>
            <span class="brand-tag">INVENTORY CORE</span>
          </div>
        </a>

        <!-- Global Search Bar -->
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <span class="search-shortcut">↵ Enter</span>
        </div>

        <!-- Right Actions -->
        <div class="nav-actions">
          <!-- Backend Status Indicator -->
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-label">Sistema Ativo</span>
          </div>

          <!-- Alerts Dropdown Trigger -->
          <div class="alerts-dropdown-wrapper">
            <button 
              class="icon-btn" 
              (click)="toggleAlerts()" 
              [class.active]="showAlerts()"
              title="Alertas de Estoque"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span *ngIf="unreadAlertsCount() > 0" class="alerts-badge">
                {{ unreadAlertsCount() }}
              </span>
            </button>

            <!-- Alerts Flyout Menu -->
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
                  ✓ Nenhum alerta pendente no momento.
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
                      <span class="alert-qty">Saldo atual: {{ alert.current_quantity }} (Mín: {{ alert.min_stock }})</span>
                    </div>
                  </div>
                  <button class="alert-dismiss" (click)="dismissAlert(alert.id)" title="Dispensar">✕</button>
                </div>
              </div>

              <div class="alerts-footer">
                <a routerLink="/produtos" (click)="showAlerts.set(false)" class="alerts-view-all">
                  Ver todos os produtos no inventário →
                </a>
              </div>
            </div>
          </div>

          <!-- User Profile Chip -->
          <div class="user-chip">
            <div class="avatar-cream">
              {{ authService.currentUser().username.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser().first_name || authService.currentUser().username }}</span>
              <span class="user-role">Super Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 500;
      background: rgba(8, 17, 44, 0.78);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(235, 224, 198, 0.12);
      box-shadow: 0 4px 24px rgba(4, 8, 22, 0.45);
    }
    .navbar-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    /* Brand */
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .brand-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--royal-500) 0%, var(--royal-700) 100%);
      color: var(--cream-50);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(48, 98, 234, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--cream-50);
    }
    .brand-accent {
      color: var(--royal-400);
      text-shadow: 0 0 12px rgba(74, 124, 245, 0.5);
    }
    .brand-tag {
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
    }

    /* Search */
    .search-box {
      position: relative;
      flex: 1;
      max-width: 440px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(235, 224, 198, 0.45);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      background: rgba(12, 25, 68, 0.55);
      border: 1px solid rgba(235, 224, 198, 0.14);
      border-radius: 12px;
      padding: 9px 80px 9px 40px;
      color: var(--cream-100);
      font-family: var(--font-sans);
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s ease;
    }
    .search-input:focus {
      background: rgba(16, 33, 84, 0.85);
      border-color: var(--royal-400);
      box-shadow: 0 0 0 3px rgba(74, 124, 245, 0.25);
    }
    .search-shortcut {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.72rem;
      color: rgba(235, 224, 198, 0.4);
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Actions */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 999px;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .status-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #34d399;
      letter-spacing: 0.02em;
    }

    /* Alerts */
    .alerts-dropdown-wrapper {
      position: relative;
    }
    .icon-btn {
      position: relative;
      background: rgba(16, 33, 84, 0.6);
      border: 1px solid rgba(235, 224, 198, 0.16);
      color: var(--cream-200);
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover, .icon-btn.active {
      background: rgba(22, 45, 115, 0.85);
      color: var(--cream-50);
      border-color: rgba(251, 247, 238, 0.35);
    }
    .alerts-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #f43f5e;
      color: white;
      font-size: 0.68rem;
      font-weight: 800;
      width: 19px;
      height: 19px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--royal-950);
      box-shadow: 0 0 10px rgba(244, 63, 94, 0.6);
    }

    /* Alerts Dropdown */
    .alerts-dropdown-menu {
      position: absolute;
      top: 50px;
      right: 0;
      width: 380px;
      background: rgba(10, 20, 52, 0.96);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(235, 224, 198, 0.25);
      border-radius: 18px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(48, 98, 234, 0.2);
      overflow: hidden;
      z-index: 1000;
      animation: scaleUp 0.18s ease-out;
    }
    .alerts-header {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .alerts-title-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alerts-title {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--cream-50);
    }
    .btn-text-cream {
      background: none;
      border: none;
      color: var(--cream-400);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-text-cream:hover {
      color: var(--cream-100);
      text-decoration: underline;
    }
    .alerts-list {
      max-height: 280px;
      overflow-y: auto;
      padding: 8px 0;
    }
    .alerts-empty {
      padding: 24px;
      text-align: center;
      color: var(--cream-300);
      font-size: 0.85rem;
    }
    .alert-item {
      padding: 10px 16px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 0.15s;
    }
    .alert-item:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .alert-item-content {
      flex: 1;
    }
    .alert-item-title {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--cream-100);
      margin-bottom: 4px;
    }
    .alert-item-sub {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alert-qty {
      font-size: 0.76rem;
      color: #fbbf24;
    }
    .alert-out .alert-qty {
      color: #fb7185;
      font-weight: 600;
    }
    .alert-dismiss {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-size: 14px;
      padding: 2px 6px;
    }
    .alert-dismiss:hover {
      color: #fff;
    }
    .alerts-footer {
      padding: 12px 18px;
      background: rgba(6, 12, 32, 0.6);
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .alerts-view-all {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--royal-300);
      text-decoration: none;
    }
    .alerts-view-all:hover {
      color: var(--cream-100);
    }

    /* User Profile */
    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 5px 12px 5px 6px;
      background: rgba(16, 33, 84, 0.55);
      border: 1px solid rgba(235, 224, 198, 0.16);
      border-radius: 999px;
    }
    .avatar-cream {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cream-200) 0%, var(--cream-400) 100%);
      color: var(--royal-950);
      font-weight: 800;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--cream-100);
      line-height: 1.1;
    }
    .user-role {
      font-size: 0.68rem;
      color: var(--cream-400);
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
  router = inject(Router);

  searchQuery = '';
  showAlerts = signal<boolean>(false);

  unreadAlertsCount() {
    return this.inventoryService.alerts().length;
  }

  toggleAlerts() {
    this.showAlerts.update(v => !v);
  }

  dismissAlert(id: number) {
    this.inventoryService.markAlertRead(id).subscribe(() => {
      this.toast.info('Alerta arquivado');
    });
  }

  markAllAsRead() {
    const list = [...this.inventoryService.alerts()];
    list.forEach(a => this.inventoryService.markAlertRead(a.id).subscribe());
    this.showAlerts.set(false);
    this.toast.success('Todos os alertas foram marcados como lidos');
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/produtos'], { queryParams: { q: this.searchQuery } });
    }
  }
}
