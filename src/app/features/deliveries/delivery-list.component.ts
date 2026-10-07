import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { DeliveryOrder, DeliveryCarrier, DeliveryStatus } from '../../models/inventory.models';

@Component({
  selector: 'app-delivery-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="deliveries-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="welcome-tag">LOGISTICA & EXPEDICAO INTEGRADA</div>
          <h1 class="page-title">Ordens de Entrega & Rastreamento</h1>
          <p class="page-desc">
            Controle de despachos sincronizado com portais oficiais de entregas (Correios, Loggi, Melhor Envio, Jadlog).
          </p>
        </div>
        <div class="header-actions">
          <a routerLink="/produtos" class="btn btn-royal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Novo Despacho no Catalogo
          </a>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-grid">
        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Total de Despachos</span>
            <div class="metric-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
          </div>
          <div class="metric-val">{{ totalCount() }}</div>
          <div class="metric-sub">Ordens emitidas</div>
        </div>

        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Em Transito / Ativos</span>
            <div class="metric-icon-box text-cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="metric-val text-cyan">{{ inTransitCount() }}</div>
          <div class="metric-sub">Cargas a caminho</div>
        </div>

        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Entregas Concluidas</span>
            <div class="metric-icon-box text-emerald">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <div class="metric-val text-emerald">{{ deliveredCount() }}</div>
          <div class="metric-sub">Finalizadas com sucesso</div>
        </div>

        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Investimento em Frete</span>
            <div class="metric-icon-box text-cream">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="metric-val currency-cream">{{ totalShippingCost() | currency:'BRL':'symbol':'1.2-2' }}</div>
          <div class="metric-sub">Custos logísticos totais</div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="liquid-glass-card toolbar-card">
        <div class="search-filter-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar por rastreamento, destinatário, endereço ou produto..." 
            class="glass-input filter-search"
          />
        </div>

        <div class="filter-controls">
          <select [(ngModel)]="selectedCarrier" class="glass-input filter-select">
            <option value="">Todas as Transportadoras</option>
            <option value="CORREIOS">Correios (SEDEX / PAC)</option>
            <option value="LOGGI">Loggi Express</option>
            <option value="MELHOR_ENVIO">Melhor Envio</option>
            <option value="JADLOG">Jadlog Logística</option>
            <option value="EXPRESS">Entrega Expressa</option>
          </select>

          <div class="status-pills">
            <button 
              class="pill-btn" 
              [class.active]="selectedStatus === ''" 
              (click)="selectedStatus = ''"
            >
              Todos
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStatus === 'IN_TRANSIT'" 
              (click)="selectedStatus = 'IN_TRANSIT'"
            >
              Em Trânsito
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStatus === 'DELIVERED'" 
              (click)="selectedStatus = 'DELIVERED'"
            >
              Entregue
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStatus === 'DISPATCHED'" 
              (click)="selectedStatus = 'DISPATCHED'"
            >
              Despachado
            </button>
          </div>
        </div>
      </div>

      <!-- Deliveries Table -->
      <div class="liquid-glass-card table-card">
        <div class="table-responsive">
          <table class="glass-table">
            <thead>
              <tr>
                <th>Código de Rastreio</th>
                <th>Transportadora</th>
                <th>Produto & Qtd</th>
                <th>Destinatário & Local</th>
                <th>Frete</th>
                <th>Status</th>
                <th>Data</th>
                <th class="text-right">Acompanhamento</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredDeliveries().length === 0">
                <td colspan="8" class="table-empty">
                  Nenhuma ordem de entrega encontrada com os filtros aplicados.
                </td>
              </tr>
              <tr *ngFor="let order of filteredDeliveries()">
                <!-- Tracking code -->
                <td>
                  <div class="tracking-cell">
                    <span class="tracking-code-link" (click)="openDetailModal(order)">
                      {{ order.tracking_code }}
                    </span>
                    <span class="carrier-tag">{{ order.carrier_display || order.carrier }}</span>
                  </div>
                </td>

                <!-- Carrier badge -->
                <td>
                  <span class="badge" [ngClass]="getCarrierBadgeClass(order.carrier)">
                    {{ order.carrier_display || order.carrier }}
                  </span>
                </td>

                <!-- Product -->
                <td>
                  <div class="prod-cell">
                    <span class="prod-name-static">{{ order.product_name }}</span>
                    <span class="prod-sku-sub">{{ order.product_sku }} - Qtd: {{ order.quantity }} un</span>
                  </div>
                </td>

                <!-- Recipient & Address -->
                <td>
                  <div class="recipient-cell">
                    <span class="recipient-name">{{ order.recipient_name }}</span>
                    <span class="recipient-addr" [title]="order.recipient_address">{{ order.recipient_address }}</span>
                    <span *ngIf="order.recipient_phone" class="recipient-phone font-mono">{{ order.recipient_phone }}</span>
                  </div>
                </td>

                <!-- Shipping cost -->
                <td>
                  <span class="currency-cream font-mono">
                    {{ order.shipping_cost | currency:'BRL':'symbol':'1.2-2' }}
                  </span>
                </td>

                <!-- Status -->
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(order.status)">
                    {{ order.status_display || order.status }}
                  </span>
                </td>

                <!-- Created Date -->
                <td class="text-xs text-cream-muted">
                  {{ order.created_at | date:'dd/MM/yyyy HH:mm' }}
                </td>

                <!-- Actions / Direct Link to Carrier Website -->
                <td class="text-right">
                  <div class="action-buttons">
                    <a 
                      *ngIf="order.external_delivery_url"
                      [href]="order.external_delivery_url" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="action-btn link-site-btn"
                      title="Abrir página oficial de rastreamento do site de entrega"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      <span>Site Oficial</span>
                    </a>

                    <button 
                      class="icon-action-btn" 
                      (click)="openDetailModal(order)" 
                      title="Detalhes & Alterar Status"
                      aria-label="Detalhes"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail & Update Status Modal -->
      <div *ngIf="showModal()" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog modal-md" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="carrier-tag">{{ selectedOrder?.carrier_display || selectedOrder?.carrier }}</span>
              <h3 class="modal-title" style="margin-top: 4px;">Rastreamento: {{ selectedOrder?.tracking_code }}</h3>
            </div>
            <button class="modal-close-btn" (click)="closeModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div *ngIf="selectedOrder" class="modal-form">
            <div class="delivery-info-summary">
              <div class="summary-item">
                <span class="summary-label">Item Despachado</span>
                <span class="summary-val">{{ selectedOrder.product_name }} ({{ selectedOrder.product_sku }})</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Volume Enviado</span>
                <span class="summary-val font-bold">{{ selectedOrder.quantity }} unidade(s)</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Destinatário</span>
                <span class="summary-val">{{ selectedOrder.recipient_name }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Telefone / Contato</span>
                <span class="summary-val">{{ selectedOrder.recipient_phone || 'Não informado' }}</span>
              </div>
              <div class="summary-item" style="grid-column: span 2;">
                <span class="summary-label">Endereço de Destino</span>
                <span class="summary-val">{{ selectedOrder.recipient_address }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Custo do Frete</span>
                <span class="summary-val currency-cream font-mono">{{ selectedOrder.shipping_cost | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Data do Despacho</span>
                <span class="summary-val">{{ selectedOrder.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <!-- External link box -->
            <div *ngIf="selectedOrder.external_delivery_url" class="tracking-box" style="margin-top: 14px;">
              <div>
                <span class="tracking-label">Portal Oficial de Rastreamento</span>
                <div class="tracking-code-val">{{ selectedOrder.tracking_code }}</div>
              </div>
              <a 
                [href]="selectedOrder.external_delivery_url" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-royal"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>Acessar Site do Parceiro</span>
              </a>
            </div>

            <!-- Alterar Status -->
            <div class="form-group" style="margin-top: 18px;">
              <label class="form-label">Atualizar Situação do Rastreamento</label>
              <select [(ngModel)]="newStatus" class="glass-input">
                <option value="PREPARING">Preparando Envio</option>
                <option value="DISPATCHED">Despachado</option>
                <option value="IN_TRANSIT">Em Trânsito para Entrega</option>
                <option value="DELIVERED">Entregue ao Destinatário</option>
                <option value="CANCELLED">Cancelado / Devolvido</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeModal()">Fechar</button>
              <button type="button" class="btn btn-cream" (click)="saveStatusUpdate()">
                Salvar Atualização
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .deliveries-page {
      padding: 32px 36px;
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

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
    .page-desc {
      font-size: 0.94rem;
      color: var(--cream-300);
      margin-top: 6px;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .metric-card {
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .metric-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .metric-label {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--cream-300);
      text-transform: uppercase;
    }
    .metric-icon-box {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cream-400);
    }
    .metric-val {
      font-size: 1.9rem;
      font-weight: 800;
      font-family: var(--font-display);
      line-height: 1.1;
      color: var(--cream-50);
    }
    .metric-sub {
      font-size: 0.78rem;
      color: var(--cream-400);
    }

    /* Toolbar */
    .toolbar-card {
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .search-filter-box {
      position: relative;
      flex: 1;
      min-width: 280px;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(235, 224, 198, 0.45);
    }
    .filter-search {
      padding-left: 42px;
    }
    .filter-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .filter-select {
      width: 220px;
      padding: 10px 14px;
    }
    .status-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(8, 17, 44, 0.6);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(235, 224, 198, 0.12);
    }
    .pill-btn {
      background: none;
      border: none;
      color: var(--cream-300);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .pill-btn:hover {
      color: #fff;
    }
    .pill-btn.active {
      background: rgba(48, 98, 234, 0.4);
      color: #fff;
    }

    /* Table */
    .table-card {
      padding: 16px 20px;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .glass-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .glass-table th {
      text-align: left;
      padding: 12px 14px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cream-400);
      border-bottom: 1px solid rgba(235, 224, 198, 0.12);
    }
    .glass-table td {
      padding: 14px;
      border-bottom: 1px solid rgba(235, 224, 198, 0.06);
      vertical-align: middle;
      color: var(--cream-100);
    }
    .glass-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .table-empty {
      text-align: center;
      padding: 40px !important;
      color: var(--cream-300);
      font-style: italic;
    }

    .tracking-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tracking-code-link {
      font-family: var(--font-mono);
      font-weight: 800;
      color: #38bdf8;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .tracking-code-link:hover {
      text-decoration: underline;
    }
    .carrier-tag {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--cream-400);
    }

    .prod-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .prod-name-static {
      font-weight: 600;
      color: var(--cream-50);
    }
    .prod-sku-sub {
      font-size: 0.78rem;
      color: var(--cream-300);
      font-family: var(--font-mono);
    }

    .recipient-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-width: 260px;
    }
    .recipient-name {
      font-weight: 600;
      color: var(--cream-50);
    }
    .recipient-addr {
      font-size: 0.78rem;
      color: var(--cream-300);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .recipient-phone {
      font-size: 0.74rem;
      color: var(--cream-400);
    }

    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .link-site-btn {
      background: rgba(48, 98, 234, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(48, 98, 234, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.15s;
    }
    .link-site-btn:hover {
      background: rgba(48, 98, 234, 0.45);
      color: #fff;
    }

    /* Badges */
    .badge-carrier-correios {
      background: rgba(234, 179, 8, 0.15);
      color: #fde047;
      border: 1px solid rgba(234, 179, 8, 0.35);
    }
    .badge-carrier-loggi {
      background: rgba(59, 130, 246, 0.15);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.35);
    }
    .badge-carrier-melhor {
      background: rgba(168, 85, 247, 0.15);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .badge-carrier-jadlog {
      background: rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .badge-carrier-express {
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    /* Modal */
    .delivery-info-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      background: rgba(6, 13, 33, 0.6);
      border: 1px solid rgba(235, 224, 198, 0.12);
      border-radius: 12px;
      padding: 16px;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .summary-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
    }
    .summary-val {
      font-size: 0.9rem;
      color: var(--cream-100);
    }

    .tracking-box {
      background: rgba(4, 9, 24, 0.7);
      border: 1px dashed rgba(235, 224, 198, 0.25);
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .tracking-label {
      font-size: 0.78rem;
      color: var(--cream-300);
      font-weight: 600;
    }
    .tracking-code-val {
      font-family: var(--font-mono);
      font-size: 1.15rem;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.08em;
    }

    @media (max-width: 900px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .toolbar-card {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-select {
        width: 100%;
      }
    }
  `]
})
export class DeliveryListComponent implements OnInit {
  inventoryService = inject(InventoryService);
  toast = inject(ToastService);

  searchTerm: string = '';
  selectedCarrier: string = '';
  selectedStatus: string = '';

  showModal = signal<boolean>(false);
  selectedOrder: DeliveryOrder | null = null;
  newStatus: DeliveryStatus = 'IN_TRANSIT';

  ngOnInit() {
    this.inventoryService.loadDeliveries().subscribe();
  }

  totalCount(): number {
    return this.inventoryService.deliveries().length;
  }

  inTransitCount(): number {
    return this.inventoryService.deliveries().filter(d => d.status === 'IN_TRANSIT' || d.status === 'DISPATCHED').length;
  }

  deliveredCount(): number {
    return this.inventoryService.deliveries().filter(d => d.status === 'DELIVERED').length;
  }

  totalShippingCost(): number {
    return this.inventoryService.deliveries().reduce((acc, d) => acc + (Number(d.shipping_cost) || 0), 0);
  }

  filteredDeliveries(): DeliveryOrder[] {
    let orders = this.inventoryService.deliveries();

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      orders = orders.filter(o => 
        o.tracking_code.toLowerCase().includes(q) ||
        o.recipient_name.toLowerCase().includes(q) ||
        o.recipient_address.toLowerCase().includes(q) ||
        (o.product_name && o.product_name.toLowerCase().includes(q)) ||
        (o.product_sku && o.product_sku.toLowerCase().includes(q))
      );
    }

    if (this.selectedCarrier) {
      orders = orders.filter(o => o.carrier === this.selectedCarrier);
    }

    if (this.selectedStatus) {
      orders = orders.filter(o => o.status === this.selectedStatus);
    }

    return orders;
  }

  getCarrierBadgeClass(carrier: DeliveryCarrier): string {
    switch (carrier) {
      case 'CORREIOS': return 'badge-carrier-correios';
      case 'LOGGI': return 'badge-carrier-loggi';
      case 'MELHOR_ENVIO': return 'badge-carrier-melhor';
      case 'JADLOG': return 'badge-carrier-jadlog';
      case 'EXPRESS': return 'badge-carrier-express';
      default: return 'badge-carrier-correios';
    }
  }

  getStatusBadgeClass(status: DeliveryStatus): string {
    switch (status) {
      case 'PREPARING': return 'badge-low';
      case 'DISPATCHED': return 'badge-normal';
      case 'IN_TRANSIT': return 'badge-category';
      case 'DELIVERED': return 'badge-normal';
      case 'CANCELLED': return 'badge-out';
      default: return 'badge-normal';
    }
  }

  openDetailModal(order: DeliveryOrder) {
    this.selectedOrder = order;
    this.newStatus = order.status;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedOrder = null;
  }

  saveStatusUpdate() {
    if (!this.selectedOrder) return;

    this.inventoryService.updateDeliveryStatus(this.selectedOrder.id, this.newStatus).subscribe({
      next: () => {
        this.toast.success(`Situação da entrega ${this.selectedOrder?.tracking_code} atualizada!`);
        this.closeModal();
      },
      error: (err) => {
        this.toast.error(err.message || 'Erro ao atualizar situação da entrega');
      }
    });
  }
}
