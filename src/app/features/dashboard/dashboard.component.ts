import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { Web3Service } from '../../core/services/web3.service';
import { Warehouse3dComponent } from '../../shared/components/warehouse-3d/warehouse-3d.component';
import { Product } from '../../models/inventory.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Warehouse3dComponent],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <div class="header-titles">
          <div class="welcome-tag">SISTEMA INTELIGENTE DE CONTROLE & EXPEDIÇÃO</div>
          <h1 class="page-title">Painel Operacional & Gêmeo 3D</h1>
          <p class="page-desc">Telemetria em tempo real, auditoria criptográfica Web3 e visualização tridimensional</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-web3" (click)="handleWeb3Audit()">
            <span class="web3-pulse-dot"></span>
            <span class="font-mono">{{ web3Service.isConnected() ? 'Auditar Registro Web3' : 'Conectar Ledger Web3' }}</span>
          </button>

          <button class="btn btn-glass" (click)="refreshData()" title="Atualizar dados">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Atualizar</span>
          </button>

          <a routerLink="/produtos" [queryParams]="{ modal: 'new' }" class="btn btn-cream">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Novo Produto</span>
          </a>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Valor em Estoque</span>
            <div class="metric-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="metric-value currency-cream">
            {{ summary()?.total_inventory_cost | currency:'BRL':'symbol':'1.2-2' }}
          </div>
          <div class="metric-sub">
            Venda estimada: {{ summary()?.total_inventory_selling | currency:'BRL':'symbol':'1.2-2' }}
          </div>
        </div>

        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Unidades Físicas</span>
            <div class="metric-icon-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          </div>
          <div class="metric-value">
            {{ summary()?.total_stock_units | number }} <span class="metric-unit">unidades</span>
          </div>
          <div class="metric-sub">
            Em {{ summary()?.total_products }} produtos catalogados
          </div>
        </div>

        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Itens em Alerta</span>
            <div class="metric-icon-box text-rose">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <div class="metric-value text-rose">
            {{ (summary()?.out_of_stock_count || 0) + (summary()?.low_stock_count || 0) }}
          </div>
          <div class="metric-sub">
            {{ summary()?.out_of_stock_count }} esgotados · {{ summary()?.low_stock_count }} baixos
          </div>
        </div>

        <div class="liquid-glass-card metric-card">
          <div class="metric-top">
            <span class="metric-label">Auditoria Web3</span>
            <div class="metric-icon-box text-cyan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>
          <div class="metric-value font-mono text-cyan">
            {{ web3Service.verifiedProofCount() }} Provas
          </div>
          <div class="metric-sub font-mono">
            {{ web3Service.isConnected() ? web3Service.networkName() : 'Imutabilidade Criptográfica' }}
          </div>
        </div>
      </div>

      <div class="warehouse-3d-section">
        <app-warehouse-3d></app-warehouse-3d>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-col">
          <div class="liquid-glass-card section-card">
            <div class="section-card-header">
              <div class="section-title-box">
                <h2 class="section-title">Distribuição por Categorias</h2>
                <span class="badge badge-category">{{ inventoryService.categories().length }} Setores</span>
              </div>
              <a routerLink="/categorias" class="btn-link-cream">
                <span>Ver todas</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
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

          <div class="liquid-glass-card section-card quick-action-card">
            <div class="section-card-header">
              <h2 class="section-title">Operações Rápidas de Fluxo</h2>
            </div>

            <div class="quick-buttons-row">
              <button class="quick-btn in-btn" (click)="openQuickModal('IN')">
                <div class="quick-btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
                <div class="quick-btn-text">
                  <strong>Entrada de Mercadoria</strong>
                  <span>Recebimento / Compra</span>
                </div>
              </button>

              <button class="quick-btn out-btn" (click)="openQuickModal('OUT')">
                <div class="quick-btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </div>
                <div class="quick-btn-text">
                  <strong>Saída de Estoque</strong>
                  <span>Expedição / Baixa</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="dashboard-col">
          <div class="liquid-glass-card section-card">
            <div class="section-card-header">
              <div class="section-title-box">
                <h2 class="section-title">Movimentações & Auditoria Criptográfica</h2>
                <span class="crypto-hash-tag" *ngIf="web3Service.lastProof()">
                  <span>TX: {{ web3Service.lastProof()?.txHash?.slice(0, 10) }}...</span>
                </span>
              </div>
              <a routerLink="/movimentacoes" class="btn-link-cream">
                <span>Livro-Razão</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
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
                        {{ m.movement_type === 'IN' ? 'ENTRADA' : (m.movement_type === 'OUT' ? 'SAIDA' : 'AJUSTE') }}
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
                      <span class="doc-tag">{{ m.reference_doc || '-' }}</span>
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

      <div *ngIf="showQuickModal()" class="modal-backdrop" (click)="closeQuickModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ quickModalType() === 'IN' ? 'Registrar Entrada de Estoque' : 'Registrar Saída de Estoque' }}
            </h3>
            <button class="modal-close-btn" (click)="closeQuickModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
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

    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .welcome-tag {
      font-size: 0.7rem;
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }
    .metric-card {
      padding: 22px 24px;
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
      letter-spacing: 0.05em;
      color: var(--cream-300);
      text-transform: uppercase;
    }
    .metric-icon-box {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cream-400);
    }
    .metric-value {
      font-size: 2.0rem;
      font-weight: 800;
      font-family: var(--font-display);
      line-height: 1.1;
      color: var(--cream-50);
    }
    .metric-unit {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--cream-400);
    }
    .metric-sub {
      font-size: 0.78rem;
      color: var(--cream-400);
    }

    .warehouse-3d-section {
      width: 100%;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
    }
    .dashboard-col {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .section-card {
      padding: 22px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .section-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .section-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title {
      font-size: 1.15rem;
      color: var(--cream-50);
      margin: 0;
    }
    .btn-link-cream {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--royal-300);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .btn-link-cream:hover {
      color: var(--cream-100);
    }

    .category-bars {
      display: flex;
      flex-direction: column;
      gap: 14px;
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
      font-size: 0.82rem;
    }
    .cat-name-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cat-color-dot {
      width: 8px;
      height: 8px;
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
      color: var(--cream-50);
    }
    .cat-items {
      color: var(--cream-muted);
      font-size: 0.75rem;
    }
    .cat-progress-bg {
      width: 100%;
      height: 6px;
      border-radius: var(--radius-pill);
      background: rgba(255, 255, 255, 0.06);
      overflow: hidden;
    }
    .cat-progress-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      transition: width 400ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .quick-buttons-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .quick-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: var(--radius-md);
      cursor: pointer;
      border: 1px solid transparent;
      text-align: left;
      transition: all var(--transition-fast);
    }
    .quick-btn.in-btn {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.25);
    }
    .quick-btn.in-btn:hover {
      background: rgba(16, 185, 129, 0.16);
      border-color: rgba(16, 185, 129, 0.45);
    }
    .quick-btn.out-btn {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.25);
    }
    .quick-btn.out-btn:hover {
      background: rgba(239, 68, 68, 0.16);
      border-color: rgba(239, 68, 68, 0.45);
    }
    .quick-btn-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
    }
    .quick-btn.in-btn .quick-btn-icon { color: #34d399; }
    .quick-btn.out-btn .quick-btn-icon { color: #f87171; }
    .quick-btn-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .quick-btn-text strong {
      font-size: 0.86rem;
      color: var(--cream-50);
    }
    .quick-btn-text span {
      font-size: 0.74rem;
      color: var(--cream-muted);
    }

    .prod-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .prod-title {
      font-weight: 600;
      color: var(--cream-50);
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
  web3Service = inject(Web3Service);

  showQuickModal = signal<boolean>(false);
  quickModalType = signal<'IN' | 'OUT'>('IN');
  quickProductId: number | null = null;
  quickQuantity: number = 1;
  quickReason: string = '';
  quickDoc: string = '';

  summary() {
    return this.inventoryService.dashboardData()?.summary;
  }

  getCategoryPercentage(units: number): number {
    const total = this.summary()?.total_stock_units || 1;
    return Math.min(100, Math.round((units / total) * 100));
  }

  refreshData(): void {
    this.inventoryService.loadDashboard().subscribe(() => {
      this.toast.success('Métricas atualizadas com sucesso');
    });
  }

  async handleWeb3Audit(): Promise<void> {
    if (!this.web3Service.isConnected()) {
      try {
        const addr = await this.web3Service.connectWallet();
        this.toast.success(`Carteira Web3 conectada: ${this.web3Service.getShortAddress(addr)}`);
      } catch (err: any) {
        this.toast.error(err.message || 'Erro ao conectar carteira Web3');
        return;
      }
    }

    const proof = await this.web3Service.generateLedgerProof(this.summary());
    this.toast.success(`Prova Criptográfica emitida com sucesso! TX: ${proof.txHash.slice(0, 16)}...`);
  }

  openQuickModal(type: 'IN' | 'OUT'): void {
    this.quickModalType.set(type);
    this.quickProductId = this.inventoryService.products()[0]?.id || null;
    this.quickQuantity = 1;
    this.quickDoc = '';
    this.quickReason = type === 'IN' ? 'Entrada manual rápida' : 'Expedição / Saída rápida';
    this.showQuickModal.set(true);
  }

  closeQuickModal(): void {
    this.showQuickModal.set(false);
  }

  submitQuickMovement(): void {
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
