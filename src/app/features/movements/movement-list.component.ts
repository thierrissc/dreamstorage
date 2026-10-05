import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { MovementType, StockMovement } from '../../models/inventory.models';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="movements-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="welcome-tag">AUDITORIA & RASTREABILIDADE</div>
          <h1 class="page-title">Movimentações de Estoque</h1>
          <p class="page-desc">Histórico imutável de entradas, baixas operacionais e conciliações de inventário físico.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-cream" (click)="openCreateModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Nova Movimentação
          </button>
        </div>
      </div>

      <!-- Quick Summary Pills -->
      <div class="summary-cards-row">
        <div class="liquid-glass-card summary-card">
          <span class="card-label">Total de Registros</span>
          <span class="card-value">{{ totalMovementsCount() }}</span>
        </div>
        <div class="liquid-glass-card summary-card border-emerald">
          <span class="card-label">Entradas Registradas</span>
          <span class="card-value text-emerald">+{{ totalInCount() }}</span>
        </div>
        <div class="liquid-glass-card summary-card border-rose">
          <span class="card-label">Saídas / Expedições</span>
          <span class="card-value text-rose">-{{ totalOutCount() }}</span>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="liquid-glass-card toolbar-card">
        <div class="search-filter-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Buscar por produto, SKU, responsável ou nº doc..." 
            class="glass-input filter-search"
          />
        </div>

        <div class="type-filter-group">
          <button 
            class="pill-btn" 
            [class.active]="selectedType === ''" 
            (click)="setTypeFilter('')"
          >
            Todas
          </button>
          <button 
            class="pill-btn pill-in" 
            [class.active]="selectedType === 'IN'" 
            (click)="setTypeFilter('IN')"
          >
            Entradas (+)
          </button>
          <button 
            class="pill-btn pill-out" 
            [class.active]="selectedType === 'OUT'" 
            (click)="setTypeFilter('OUT')"
          >
            Saídas (-)
          </button>
          <button 
            class="pill-btn pill-adjust" 
            [class.active]="selectedType === 'ADJUST'" 
            (click)="setTypeFilter('ADJUST')"
          >
            Ajustes (Balanço)
          </button>
        </div>
      </div>

      <!-- Table Card -->
      <div class="liquid-glass-card table-card">
        <div class="table-responsive">
          <table class="glass-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data / Hora</th>
                <th>Produto & SKU</th>
                <th>Quantidade</th>
                <th>Saldo (Antes → Depois)</th>
                <th>Custo Total</th>
                <th>Motivo & Documento</th>
                <th>Operador</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredMovements().length === 0">
                <td colspan="8" class="table-empty">
                  Nenhuma movimentação encontrada para os filtros selecionados.
                </td>
              </tr>
              <tr *ngFor="let m of filteredMovements()">
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
                <td class="text-xs text-cream-muted whitespace-nowrap">
                  {{ m.created_at | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td>
                  <div class="prod-cell">
                    <span class="prod-name">{{ m.product_name }}</span>
                    <span class="sku-tag">{{ m.product_sku }}</span>
                  </div>
                </td>
                <td class="font-mono font-bold" [ngClass]="m.movement_type === 'IN' ? 'text-emerald' : 'text-rose'">
                  {{ m.movement_type === 'IN' ? '+' : '-' }}{{ m.quantity }} {{ m.product_unit }}
                </td>
                <td class="font-mono text-cream-muted">
                  {{ m.previous_stock }} → <strong class="text-cream">{{ m.new_stock }}</strong>
                </td>
                <td class="font-mono text-cream">
                  {{ m.total_value | currency:'BRL':'symbol':'1.2-2' }}
                </td>
                <td>
                  <div class="reason-cell">
                    <span class="reason-text">{{ m.reason }}</span>
                    <span *ngIf="m.reference_doc" class="doc-pill">{{ m.reference_doc }}</span>
                  </div>
                </td>
                <td>
                  <span class="operator-badge">{{ m.performed_by || 'Administrador' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- New Movement Modal -->
      <div *ngIf="showModal()" class="modal-backdrop" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Registrar Movimentacao de Estoque</h3>
            <button class="modal-close-btn" (click)="closeModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveMovement()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Tipo de Movimento *</label>
              <div class="movement-type-toggle">
                <button 
                  type="button" 
                  class="type-toggle-btn in-btn" 
                  [class.active]="formData.movement_type === 'IN'"
                  (click)="formData.movement_type = 'IN'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                  <span>Entrada (Compras)</span>
                </button>
                <button 
                  type="button" 
                  class="type-toggle-btn out-btn" 
                  [class.active]="formData.movement_type === 'OUT'"
                  (click)="formData.movement_type = 'OUT'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                  <span>Saida (Vendas)</span>
                </button>
                <button 
                  type="button" 
                  class="type-toggle-btn adjust-btn" 
                  [class.active]="formData.movement_type === 'ADJUST'"
                  (click)="formData.movement_type = 'ADJUST'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  <span>Ajuste de Balanco</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Produto *</label>
              <select [(ngModel)]="formData.product" name="product" required class="glass-input">
                <option [ngValue]="null">-- Selecione um produto --</option>
                <option *ngFor="let p of inventoryService.products()" [ngValue]="p.id">
                  {{ p.sku }} - {{ p.name }} (Saldo atual: {{ p.quantity }} {{ p.unit_measure }})
                </option>
              </select>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Quantidade *</label>
                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="formData.quantity" 
                  name="quantity" 
                  required 
                  class="glass-input font-bold" 
                  placeholder="Ex: 10"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Documento / NF-e</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.reference_doc" 
                  name="reference_doc" 
                  class="glass-input font-mono" 
                  placeholder="Ex: NF-e 88912"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo / Justificativa *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.reason" 
                name="reason" 
                required 
                class="glass-input" 
                placeholder="Ex: Compra em lote de fornecedor / Saída de venda cliente"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Observações / Notas</label>
              <textarea 
                [(ngModel)]="formData.notes" 
                name="notes" 
                rows="2" 
                class="glass-input" 
                placeholder="Detalhes adicionais de auditoria..."
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-royal">
                Confirmar Registro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movements-page {
      padding: 32px 36px;
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Header */
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

    /* Summary cards */
    .summary-cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .summary-card {
      padding: 18px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .border-emerald { border-left: 4px solid #10b981; }
    .border-rose { border-left: 4px solid #f43f5e; }
    .card-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--cream-300);
    }
    .card-value {
      font-family: var(--font-heading);
      font-size: 1.6rem;
      font-weight: 800;
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
    .type-filter-group {
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
      padding: 6px 14px;
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
    .pill-in.active {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
    }
    .pill-out.active {
      background: rgba(244, 63, 94, 0.25);
      color: #fb7185;
    }
    .pill-adjust.active {
      background: rgba(48, 98, 234, 0.25);
      color: var(--royal-200);
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
      font-size: 0.86rem;
    }
    .glass-table th {
      text-align: left;
      padding: 14px 16px;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-table td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--cream-100);
      vertical-align: middle;
    }
    .glass-table tr:hover td {
      background: rgba(255, 255, 255, 0.025);
    }
    .table-empty {
      text-align: center;
      padding: 40px !important;
      color: var(--cream-400);
    }

    /* Cell styles */
    .prod-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .prod-name {
      font-weight: 600;
      color: var(--cream-100);
    }
    .reason-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .doc-pill {
      font-family: var(--font-mono);
      font-size: 0.74rem;
      color: var(--cream-300);
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
    }
    .operator-badge {
      font-size: 0.78rem;
      color: var(--cream-300);
      background: rgba(16, 33, 84, 0.6);
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(235, 224, 198, 0.1);
    }
    .font-mono { font-family: var(--font-mono); }
    .font-bold { font-weight: 700; }
    .text-xs { font-size: 0.75rem; }
    .text-emerald { color: #34d399; }
    .text-rose { color: #fb7185; }
    .text-cream { color: var(--cream-50); }
    .text-cream-muted { color: var(--cream-400); }
    .whitespace-nowrap { white-space: nowrap; }

    /* Modal Form */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .modal-title {
      font-size: 1.35rem;
      color: var(--cream-50);
    }
    .modal-close-btn {
      background: none;
      border: none;
      color: var(--cream-400);
      font-size: 1.3rem;
      cursor: pointer;
    }
    .movement-type-toggle {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .type-toggle-btn {
      padding: 10px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(8, 17, 44, 0.6);
      color: var(--cream-300);
      cursor: pointer;
      transition: all 0.15s;
    }
    .type-toggle-btn.in-btn.active {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.5);
    }
    .type-toggle-btn.out-btn.active {
      background: rgba(244, 63, 94, 0.25);
      color: #fb7185;
      border-color: rgba(244, 63, 94, 0.5);
    }
    .type-toggle-btn.adjust-btn.active {
      background: rgba(48, 98, 234, 0.3);
      color: var(--royal-200);
      border-color: rgba(74, 124, 245, 0.5);
    }
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

    @media (max-width: 900px) {
      .summary-cards-row {
        grid-template-columns: 1fr;
      }
      .toolbar-card {
        flex-direction: column;
        align-items: stretch;
      }
      .movement-type-toggle {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MovementListComponent {
  inventoryService = inject(InventoryService);
  toast = inject(ToastService);

  searchQuery: string = '';
  selectedType: string = '';

  showModal = signal<boolean>(false);
  formData: any = this.getEmptyForm();

  getEmptyForm() {
    return {
      product: null,
      movement_type: 'IN' as MovementType,
      quantity: 1,
      reason: '',
      reference_doc: '',
      notes: ''
    };
  }

  totalMovementsCount() {
    return this.inventoryService.movements().length;
  }

  totalInCount() {
    return this.inventoryService.movements().filter(m => m.movement_type === 'IN').length;
  }

  totalOutCount() {
    return this.inventoryService.movements().filter(m => m.movement_type === 'OUT').length;
  }

  setTypeFilter(type: string) {
    this.selectedType = type;
  }

  filteredMovements(): StockMovement[] {
    let list = this.inventoryService.movements();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(m =>
        (m.product_name && m.product_name.toLowerCase().includes(q)) ||
        (m.product_sku && m.product_sku.toLowerCase().includes(q)) ||
        (m.reason && m.reason.toLowerCase().includes(q)) ||
        (m.reference_doc && m.reference_doc.toLowerCase().includes(q)) ||
        (m.performed_by && m.performed_by.toLowerCase().includes(q))
      );
    }

    if (this.selectedType) {
      list = list.filter(m => m.movement_type === this.selectedType);
    }

    return list;
  }

  openCreateModal() {
    this.formData = this.getEmptyForm();
    const prods = this.inventoryService.products();
    if (prods.length > 0) this.formData.product = prods[0].id;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveMovement() {
    if (!this.formData.product) {
      this.toast.error('Selecione um produto.');
      return;
    }
    if (!this.formData.quantity || this.formData.quantity <= 0) {
      this.toast.error('Informe uma quantidade válida.');
      return;
    }
    if (!this.formData.reason) {
      this.toast.error('Informe o motivo da movimentação.');
      return;
    }

    this.inventoryService.createMovement(this.formData).subscribe({
      next: () => {
        this.toast.success('Movimentação registrada com sucesso!');
        this.closeModal();
      },
      error: (err) => {
        this.toast.error(err.message || 'Erro ao registrar movimentação');
      }
    });
  }
}
