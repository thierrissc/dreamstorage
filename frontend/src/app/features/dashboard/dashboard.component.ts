import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../models/inventory.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="welcome-tag">GESTÃO OPERACIONAL DE ESTOQUE</div>
          <h1 class="page-title">Painel de Controle <span class="text-royal">Liquid Glass</span></h1>
          <p class="page-desc">Monitoramento analítico em tempo real com controle de rupturas e valorização de ativos.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-glass" (click)="refreshData()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Sincronizar
          </button>
          <a routerLink="/produtos" [queryParams]="{ modal: 'new' }" class="btn btn-cream">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Produto
          </a>
        </div>
      </div>

      <!-- Critical Alert Banner if needed -->
      <div *ngIf="summary()?.out_of_stock_count! > 0 || summary()?.low_stock_count! > 0" class="critical-banner">
        <div class="banner-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="banner-content">
          <div class="banner-title">Atenção Necessária: Itens Críticos de Estoque</div>
          <div class="banner-text">
            Existem <strong>{{ summary()?.out_of_stock_count }} itens zerados</strong> e 
            <strong>{{ summary()?.low_stock_count }} itens abaixo do estoque mínimo</strong>.
          </div>
        </div>
        <a routerLink="/produtos" [queryParams]="{ status: 'LOW_STOCK' }" class="btn btn-sm btn-danger">
          Ver Itens Críticos →
        </a>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="metrics-grid">
        <!-- Metric 1: Valuation -->
        <div class="liquid-glass-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Valor de Custo do Inventário</span>
            <div class="metric-icon-bubble royal-bubble">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="metric-value currency-cream">
            {{ summary()?.total_inventory_cost | currency:'BRL':'symbol':'1.2-2' }}
          </div>
          <div class="metric-footer">
            <span class="metric-sub-highlight">Venda Projetada: {{ summary()?.total_inventory_selling | currency:'BRL':'symbol':'1.2-2' }}</span>
          </div>
        </div>

        <!-- Metric 2: Total Units -->
        <div class="liquid-glass-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Unidades em Depósito</span>
            <div class="metric-icon-bubble cream-bubble">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          </div>
          <div class="metric-value text-cream">
            {{ summary()?.total_stock_units | number }} <span class="metric-unit">unidades</span>
          </div>
          <div class="metric-footer">
            <span class="metric-sub-text">Distribuídas em <strong>{{ summary()?.total_products }} produtos</strong> cadastrados</span>
          </div>
        </div>

        <!-- Metric 3: Critical Products -->
        <div class="liquid-glass-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Índice de Ruptura</span>
            <div class="metric-icon-bubble warn-bubble">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <div class="metric-value text-warn">
            {{ summary()?.out_of_stock_count }} <span class="metric-unit">esgotados</span>
          </div>
          <div class="metric-footer">
            <span class="metric-sub-text"><strong>{{ summary()?.low_stock_count }}</strong> itens em nível crítico de ressuprimento</span>
          </div>
        </div>

        <!-- Metric 4: Monthly Flow -->
        <div class="liquid-glass-card metric-card">
          <div class="metric-header">
            <span class="metric-label">Movimentações no Mês</span>
            <div class="metric-icon-bubble emerald-bubble">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="metric-value text-emerald">
            +{{ summary()?.month_in_units }} / -{{ summary()?.month_out_units }}
          </div>
          <div class="metric-footer">
            <span class="metric-sub-highlight">+{{ (summary()?.month_in_units || 0) - (summary()?.month_out_units || 0) }} saldo líquido</span>
          </div>
        </div>
      </div>

      <!-- Main Layout Columns -->
      <div class="dashboard-grid">
        <!-- Left: Categories Distribution & Quick Restock -->
        <div class="dashboard-col">
          <!-- Categories Distribution Card -->
          <div class="liquid-glass-card section-card">
            <div class="section-card-header">
              <div>
                <h2 class="section-title">Distribuição por Categoria</h2>
                <span class="section-subtitle">Ocupação e densidade de inventário</span>
              </div>
              <a routerLink="/categorias" class="btn-link-cream">Gerenciar →</a>
            </div>

            <div class="category-bars">
              <div *ngFor="let cat of inventoryService.dashboardData()?.categories_distribution" class="cat-bar-item">
                <div class="cat-bar-info">
                  <div class="cat-name-box">
                    <span class="cat-color-dot" [style.background]="cat.color"></span>
                    <span class="cat-name">{{ cat.name }}</span>
                  </div>
                  <div class="cat-counts">
                    <span class="cat-units">{{ cat.total_units }} un</span>
                    <span class="cat-items">({{ cat.items_count }} itens)</span>
                  </div>
                </div>
                <div class="cat-progress-bg">
                  <div 
                    class="cat-progress-fill" 
                    [style.background]="cat.color"
                    [style.width.%]="getCategoryPercentage(cat.total_units)"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stock Movement Trigger Card -->
          <div class="liquid-glass-card section-card quick-action-card">
            <div class="section-card-header">
              <div>
                <h2 class="section-title">Ações Operacionais Rápidas</h2>
                <span class="section-subtitle">Registros imediatos de auditoria</span>
              </div>
            </div>

            <div class="quick-buttons-row">
              <button class="quick-btn in-btn" (click)="openQuickModal('IN')">
                <div class="quick-btn-icon">↓</div>
                <div class="quick-btn-text">
                  <strong>Entrada de Mercadoria</strong>
                  <span>Compra / Recebimento</span>
                </div>
              </button>

              <button class="quick-btn out-btn" (click)="openQuickModal('OUT')">
                <div class="quick-btn-icon">↑</div>
                <div class="quick-btn-text">
                  <strong>Saída de Estoque</strong>
                  <span>Venda / Expedição</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Recent Activity Audit Table -->
        <div class="dashboard-col">
          <div class="liquid-glass-card section-card">
            <div class="section-card-header">
              <div>
                <h2 class="section-title">Últimas Movimentações</h2>
                <span class="section-subtitle">Rastreabilidade e auditoria em tempo real</span>
              </div>
              <a routerLink="/movimentacoes" class="btn-link-cream">Ver histórico completo →</a>
            </div>

            <div class="table-responsive">
              <table class="glass-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Produto / SKU</th>
                    <th>Quantidade</th>
                    <th>Saldo</th>
                    <th>Documento</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of inventoryService.dashboardData()?.recent_movements">
                    <td>
                      <span 
                        class="badge" 
                        [ngClass]="{
                          'badge-normal': m.movement_type === 'IN',
                          'badge-out': m.movement_type === 'OUT',
                          'badge-category': m.movement_type === 'ADJUST'
                        }"
                      >
                        {{ m.movement_type === 'IN' ? 'ENTRADA' : (m.movement_type === 'OUT' ? 'SAÍDA' : 'AJUSTE') }}
                      </span>
                    </td>
                    <td>
                      <div class="prod-cell">
                        <span class="prod-title">{{ m.product_name }}</span>
                        <span class="sku-tag">{{ m.product_sku }}</span>
                      </div>
                    </td>
                    <td class="font-mono font-bold" [ngClass]="m.movement_type === 'IN' ? 'text-emerald' : 'text-rose'">
                      {{ m.movement_type === 'IN' ? '+' : '-' }}{{ m.quantity }} {{ m.product_unit }}
                    </td>
                    <td class="font-mono text-cream-muted">
                      {{ m.new_stock }}
                    </td>
                    <td>
                      <span class="doc-tag">{{ m.reference_doc || '—' }}</span>
                    </td>
                    <td class="text-xs text-cream-muted">
                      {{ m.created_at | date:'dd/MM HH:mm' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Movement Modal -->
      <div *ngIf="showQuickModal()" class="modal-backdrop" (click)="closeQuickModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ quickModalType() === 'IN' ? '↓ Registrar Entrada de Estoque' : '↑ Registrar Saída de Estoque' }}
            </h3>
            <button class="modal-close-btn" (click)="closeQuickModal()">✕</button>
          </div>

          <form (ngSubmit)="submitQuickMovement()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Selecione o Produto *</label>
              <select [(ngModel)]="quickProductId" name="product" required class="glass-input">
                <option [ngValue]="null">-- Escolha um produto --</option>
                <option *ngFor="let p of inventoryService.products()" [ngValue]="p.id">
                  {{ p.sku }} - {{ p.name }} (Estoque atual: {{ p.quantity }} {{ p.unit_measure }})
                </option>
              </select>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Quantidade *</label>
                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="quickQuantity" 
                  name="quantity" 
                  required 
                  class="glass-input" 
                  placeholder="Ex: 5"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Documento / NF-e</label>
                <input 
                  type="text" 
                  [(ngModel)]="quickDoc" 
                  name="doc" 
                  class="glass-input" 
                  placeholder="Ex: NF-4490"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo da Movimentação *</label>
              <input 
                type="text" 
                [(ngModel)]="quickReason" 
                name="reason" 
                required 
                class="glass-input" 
                placeholder="Ex: Reposição de fornecedor / Pedido de cliente"
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeQuickModal()">Cancelar</button>
              <button 
                type="submit" 
                class="btn"
                [ngClass]="quickModalType() === 'IN' ? 'btn-success' : 'btn-danger'"
              >
                Confirmar {{ quickModalType() === 'IN' ? 'Entrada' : 'Saída' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 32px 36px;
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Page Header */
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .welcome-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: var(--cream-400);
      margin-bottom: 4px;
    }
    .page-title {
      font-size: 2.2rem;
      line-height: 1.15;
    }
    .text-royal {
      background: linear-gradient(135deg, var(--royal-300) 0%, var(--cream-100) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .page-desc {
      font-size: 0.94rem;
      color: var(--cream-300);
      margin-top: 6px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Critical Alert Banner */
    .critical-banner {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(16, 33, 84, 0.6) 100%);
      border: 1px solid rgba(244, 63, 94, 0.35);
      border-radius: 18px;
      backdrop-filter: blur(14px);
    }
    .banner-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(244, 63, 94, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .banner-content {
      flex: 1;
    }
    .banner-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--cream-50);
    }
    .banner-text {
      font-size: 0.85rem;
      color: var(--cream-200);
      margin-top: 2px;
    }

    /* KPI Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .metric-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .metric-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--cream-300);
    }
    .metric-icon-bubble {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .royal-bubble {
      background: rgba(48, 98, 234, 0.2);
      color: var(--royal-300);
      border: 1px solid rgba(74, 124, 245, 0.3);
    }
    .cream-bubble {
      background: rgba(222, 205, 169, 0.16);
      color: var(--cream-200);
      border: 1px solid rgba(222, 205, 169, 0.3);
    }
    .warn-bubble {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .emerald-bubble {
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .metric-value {
      font-family: var(--font-heading);
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .metric-unit {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--cream-400);
    }
    .text-warn { color: #fbbf24; }
    .text-emerald { color: #34d399; }
    .text-rose { color: #fb7185; }
    .text-cream { color: var(--cream-50); }
    .metric-footer {
      font-size: 0.78rem;
      color: var(--cream-400);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 10px;
    }
    .metric-sub-highlight {
      color: var(--cream-200);
      font-weight: 600;
    }

    /* Main Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1.35fr;
      gap: 24px;
    }
    .dashboard-col {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .section-card {
      padding: 24px;
    }
    .section-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 1.15rem;
      color: var(--cream-50);
    }
    .section-subtitle {
      font-size: 0.78rem;
      color: var(--cream-400);
    }
    .btn-link-cream {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--royal-300);
      text-decoration: none;
    }
    .btn-link-cream:hover {
      color: var(--cream-100);
      text-decoration: underline;
    }

    /* Category Progress Bars */
    .category-bars {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .cat-bar-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cat-bar-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .cat-name-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cat-color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .cat-name {
      font-weight: 600;
      color: var(--cream-100);
    }
    .cat-counts {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cat-units {
      font-weight: 700;
      color: var(--cream-200);
      font-family: var(--font-mono);
    }
    .cat-items {
      font-size: 0.75rem;
      color: var(--cream-400);
    }
    .cat-progress-bg {
      height: 7px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .cat-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.5s ease;
    }

    /* Quick Actions */
    .quick-buttons-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .quick-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      border-radius: 14px;
      border: 1px solid rgba(235, 224, 198, 0.16);
      background: rgba(16, 33, 84, 0.5);
      color: var(--cream-100);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }
    .quick-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
    .in-btn:hover {
      border-color: rgba(16, 185, 129, 0.5);
      background: rgba(16, 185, 129, 0.15);
    }
    .out-btn:hover {
      border-color: rgba(244, 63, 94, 0.5);
      background: rgba(244, 63, 94, 0.15);
    }
    .quick-btn-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      font-weight: 800;
    }
    .in-btn .quick-btn-icon {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .out-btn .quick-btn-icon {
      background: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }
    .quick-btn-text strong {
      display: block;
      font-size: 0.92rem;
      color: var(--cream-50);
    }
    .quick-btn-text span {
      font-size: 0.76rem;
      color: var(--cream-400);
    }

    /* Table */
    .table-responsive {
      overflow-x: auto;
    }
    .glass-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;
    }
    .glass-table th {
      text-align: left;
      padding: 12px 14px;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-table td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--cream-100);
    }
    .glass-table tr:hover td {
      background: rgba(255, 255, 255, 0.03);
    }
    .prod-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .prod-title {
      font-weight: 600;
      color: var(--cream-100);
    }
    .doc-tag {
      font-size: 0.76rem;
      color: var(--cream-300);
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .text-xs { font-size: 0.76rem; }
    .text-cream-muted { color: var(--cream-400); }

    /* Modal Form */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .modal-title {
      font-size: 1.25rem;
      color: var(--cream-50);
    }
    .modal-close-btn {
      background: none;
      border: none;
      color: var(--cream-400);
      font-size: 1.2rem;
      cursor: pointer;
    }
    .modal-close-btn:hover { color: #fff; }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    @media (max-width: 1100px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 600px) {
      .dashboard-page {
        padding: 16px;
      }
      .metrics-grid {
        grid-template-columns: 1fr;
      }
      .quick-buttons-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  inventoryService = inject(InventoryService);
  toast = inject(ToastService);

  showQuickModal = signal<boolean>(false);
  quickModalType = signal<'IN' | 'OUT'>('IN');
  quickProductId: number | null = null;
  quickQuantity: number = 1;
  quickReason: string = '';
  quickDoc: string = '';

  summary() {
    return this.inventoryService.dashboardData()?.summary;
  }

  getCategoryPercentage(units: number) {
    const total = this.summary()?.total_stock_units || 1;
    return Math.min(100, Math.round((units / total) * 100));
  }

  refreshData() {
    this.inventoryService.loadDashboard().subscribe(() => {
      this.toast.success('Métricas atualizadas com sucesso');
    });
  }

  openQuickModal(type: 'IN' | 'OUT') {
    this.quickModalType.set(type);
    this.quickProductId = this.inventoryService.products()[0]?.id || null;
    this.quickQuantity = 1;
    this.quickDoc = '';
    this.quickReason = type === 'IN' ? 'Entrada manual rápida' : 'Expedição / Saída rápida';
    this.showQuickModal.set(true);
  }

  closeQuickModal() {
    this.showQuickModal.set(false);
  }

  submitQuickMovement() {
    if (!this.quickProductId) {
      this.toast.error('Selecione um produto.');
      return;
    }
    if (!this.quickQuantity || this.quickQuantity <= 0) {
      this.toast.error('Informe uma quantidade válida.');
      return;
    }

    this.inventoryService.quickMovement(this.quickProductId, {
      movement_type: this.quickModalType(),
      quantity: Number(this.quickQuantity),
      reason: this.quickReason,
      reference_doc: this.quickDoc
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Movimentação realizada com sucesso!');
        this.closeQuickModal();
      },
      error: (err) => {
        this.toast.error(err.message || 'Erro ao realizar movimentação');
      }
    });
  }
}
