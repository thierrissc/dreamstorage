import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, StockMovement, UnitMeasure, DeliveryOrder, DeliveryCarrier } from '../../models/inventory.models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="products-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="welcome-tag">GESTÃO DE CATÁLOGO & INVENTÁRIO</div>
          <h1 class="page-title">Produtos & Estoque</h1>
          <p class="page-desc">Controle minucioso de itens, precificação, posições de armazém e níveis de ressuprimento.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-cream" (click)="openCreateModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            + Cadastrar Produto
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="liquid-glass-card toolbar-card">
        <div class="search-filter-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="applyFilters()" 
            placeholder="Buscar por nome, SKU, código de barras ou estante..." 
            class="glass-input filter-search"
          />
        </div>

        <div class="filter-controls">
          <!-- View Mode: Ativos / Arquivados / Todos -->
          <div class="status-pills">
            <button 
              class="pill-btn" 
              [class.active]="viewMode === 'ACTIVE'" 
              (click)="setViewMode('ACTIVE')"
            >
              Ativos ({{ activeCount() }})
            </button>
            <button 
              class="pill-btn" 
              [class.active]="viewMode === 'ARCHIVED'" 
              (click)="setViewMode('ARCHIVED')"
            >
              Arquivados ({{ archivedCount() }})
            </button>
            <button 
              class="pill-btn" 
              [class.active]="viewMode === 'ALL'" 
              (click)="setViewMode('ALL')"
            >
              Todos ({{ totalCount() }})
            </button>
          </div>

          <!-- Category Filter -->
          <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="glass-input filter-select">
            <option value="">Todas as Categorias</option>
            <option *ngFor="let cat of inventoryService.categories()" [value]="cat.id">
              {{ cat.name }}
            </option>
          </select>

          <!-- Status Filter Pills -->
          <div class="status-pills" *ngIf="viewMode !== 'ARCHIVED'">
            <button 
              class="pill-btn" 
              [class.active]="selectedStatus === ''" 
              (click)="setStatusFilter('')"
            >
              Todos os Níveis
            </button>
            <button 
              class="pill-btn pill-normal" 
              [class.active]="selectedStatus === 'NORMAL'" 
              (click)="setStatusFilter('NORMAL')"
            >
              Saudável
            </button>
            <button 
              class="pill-btn pill-low" 
              [class.active]="selectedStatus === 'LOW_STOCK'" 
              (click)="setStatusFilter('LOW_STOCK')"
            >
              Estoque Baixo ({{ lowCount() }})
            </button>
            <button 
              class="pill-btn pill-out" 
              [class.active]="selectedStatus === 'OUT_OF_STOCK'" 
              (click)="setStatusFilter('OUT_OF_STOCK')"
            >
              Esgotado ({{ outCount() }})
            </button>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="liquid-glass-card table-card">
        <div class="table-responsive">
          <table class="glass-table">
            <thead>
              <tr>
                <th>Produto & Local</th>
                <th>SKU / Código</th>
                <th>Categoria</th>
                <th>Preço Custo / Venda</th>
                <th>Estoque Atual</th>
                <th>Status</th>
                <th class="text-right">Ações & Despacho</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="filteredProducts().length === 0">
                <td colspan="7" class="table-empty">
                  Nenhum produto encontrado com os filtros aplicados.
                </td>
              </tr>
              <tr *ngFor="let p of filteredProducts()">
                <!-- Product Name and Location -->
                <td>
                  <div class="prod-cell">
                    <span class="prod-name-clickable" (click)="openDetailModal(p)">{{ p.name }}</span>
                    <span class="prod-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {{ p.location || 'Depósito Geral' }}
                    </span>
                  </div>
                </td>

                <!-- SKU & Barcode -->
                <td>
                  <div class="sku-cell">
                    <span class="sku-tag">{{ p.sku }}</span>
                    <span *ngIf="p.barcode" class="barcode-sub">{{ p.barcode }}</span>
                  </div>
                </td>

                <!-- Category -->
                <td>
                  <span class="badge badge-category" [style.borderColor]="p.category_color">
                    {{ p.category_name || 'Sem Categoria' }}
                  </span>
                </td>

                <!-- Cost / Selling -->
                <td>
                  <div class="price-cell">
                    <div class="price-cost">Custo: {{ p.cost_price | currency:'BRL':'symbol':'1.2-2' }}</div>
                    <div class="price-sell currency-cream">Venda: {{ p.selling_price | currency:'BRL':'symbol':'1.2-2' }}</div>
                    <div class="price-margin text-emerald font-mono">+{{ p.margin_percentage }}% margem</div>
                  </div>
                </td>

                <!-- Stock Quantity & Visual Fill -->
                <td>
                  <div class="stock-cell">
                    <div class="stock-numbers">
                      <span class="stock-qty" [ngClass]="p.quantity <= 0 ? 'text-rose' : (p.quantity <= p.min_stock ? 'text-warn' : 'text-cream')">
                        {{ p.quantity }} {{ p.unit_measure }}
                      </span>
                      <span class="stock-minmax">Mín: {{ p.min_stock }}</span>
                    </div>
                    <div class="stock-gauge-bg">
                      <div 
                        class="stock-gauge-fill" 
                        [style.width.%]="getStockGauge(p)"
                        [ngClass]="p.quantity <= 0 ? 'bg-rose' : (p.quantity <= p.min_stock ? 'bg-warn' : 'bg-emerald')"
                      ></div>
                    </div>
                  </div>
                </td>

                <!-- Status Badge -->
                <td>
                  <span *ngIf="p.is_archived" class="badge badge-low" [title]="p.archive_reason || 'Item arquivado'">
                    Arquivado
                  </span>
                  <span 
                    *ngIf="!p.is_archived"
                    class="badge" 
                    [ngClass]="{
                      'badge-normal': p.stock_status === 'NORMAL',
                      'badge-low': p.stock_status === 'LOW_STOCK',
                      'badge-out': p.stock_status === 'OUT_OF_STOCK'
                    }"
                  >
                    {{ p.stock_status === 'NORMAL' ? 'Normal' : (p.stock_status === 'LOW_STOCK' ? 'Baixo Estoque' : 'Esgotado') }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="text-right">
                  <div class="action-buttons">
                    <!-- Ações para itens arquivados -->
                    <ng-container *ngIf="p.is_archived">
                      <button class="action-btn in-btn" (click)="unarchive(p)" title="Desarquivar e reativar produto no catálogo">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="1 4 1 10 7 10"></polyline>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        <span>Reativar</span>
                      </button>
                    </ng-container>

                    <!-- Ações para itens ativos -->
                    <ng-container *ngIf="!p.is_archived">
                      <!-- Despacho para Entrega -->
                      <button 
                        class="action-btn dispatch-btn" 
                        (click)="openDispatchModal(p)" 
                        title="Despachar para site de entregas"
                        [disabled]="p.quantity <= 0"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                        <span>Despachar</span>
                      </button>

                      <button class="action-btn in-btn" (click)="openQuickModal(p, 'IN')" title="Entrada Rápida">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                        <span>Entrada</span>
                      </button>
                      <button class="action-btn out-btn" (click)="openQuickModal(p, 'OUT')" title="Saída Rápida" [disabled]="p.quantity <= 0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="12" y1="19" x2="12" y2="5"></line>
                          <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                        <span>Saída</span>
                      </button>
                      <button class="icon-action-btn" (click)="openEditModal(p)" title="Editar produto" aria-label="Editar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button class="icon-action-btn" (click)="openArchiveModal(p)" title="Salvar como item arquivado" aria-label="Arquivar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8"></polyline>
                          <rect x="1" y="3" width="22" height="5"></rect>
                          <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                      </button>
                    </ng-container>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Product Modal -->
      <div *ngIf="showFormModal()" class="modal-backdrop" (click)="closeFormModal()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ editingProductId ? 'Editar Produto: ' + formData.sku : 'Cadastrar Novo Produto' }}
            </h3>
            <button class="modal-close-btn" (click)="closeFormModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveProduct()" class="modal-form">
            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">SKU / Código Único *</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.sku" 
                  name="sku" 
                  required 
                  class="glass-input font-mono" 
                  placeholder="EX: HW-SRV-001"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Código de Barras (EAN)</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.barcode" 
                  name="barcode" 
                  class="glass-input font-mono" 
                  placeholder="Ex: 7891234567890"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Unidade de Medida *</label>
                <select [(ngModel)]="formData.unit_measure" name="unit_measure" class="glass-input">
                  <option value="UN">Unidade (UN)</option>
                  <option value="CX">Caixa (CX)</option>
                  <option value="PC">Peça (PC)</option>
                  <option value="KG">Quilo (KG)</option>
                  <option value="MT">Metro (MT)</option>
                  <option value="LT">Litro (LT)</option>
                  <option value="PAR">Par (PAR)</option>
                  <option value="KIT">Kit (KIT)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nome do Produto *</label>
              <input 
                type="text" 
                [(ngModel)]="formData.name" 
                name="name" 
                required 
                class="glass-input" 
                placeholder="Ex: Servidor PowerEdge R750 2U Dual Xeon"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descrição Técnica</label>
              <textarea 
                [(ngModel)]="formData.description" 
                name="description" 
                rows="2" 
                class="glass-input" 
                placeholder="Especificações técnicas, compatibilidades, observações..."
              ></textarea>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Categoria *</label>
                <select [(ngModel)]="formData.category" name="category" class="glass-input">
                  <option [ngValue]="null">-- Selecione a Categoria --</option>
                  <option *ngFor="let cat of inventoryService.categories()" [ngValue]="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Fornecedor Principal</label>
                <select [(ngModel)]="formData.supplier" name="supplier" class="glass-input">
                  <option [ngValue]="null">-- Selecione o Fornecedor --</option>
                  <option *ngFor="let sup of inventoryService.suppliers()" [ngValue]="sup.id">
                    {{ sup.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">Preço de Custo (R$) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  [(ngModel)]="formData.cost_price" 
                  name="cost_price" 
                  required 
                  class="glass-input" 
                  placeholder="0.00"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Preço de Venda (R$) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  [(ngModel)]="formData.selling_price" 
                  name="selling_price" 
                  required 
                  class="glass-input" 
                  placeholder="0.00"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Local no Depósito</label>
                <input 
                  type="text" 
                  [(ngModel)]="formData.location" 
                  name="location" 
                  class="glass-input" 
                  placeholder="Ex: Corredor B - Prateleira 4"
                />
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">Quantidade Inicial *</label>
                <input 
                  type="number" 
                  min="0" 
                  [(ngModel)]="formData.quantity" 
                  name="quantity" 
                  required 
                  class="glass-input" 
                  placeholder="0"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Estoque Mínimo (Alerta) *</label>
                <input 
                  type="number" 
                  min="0" 
                  [(ngModel)]="formData.min_stock" 
                  name="min_stock" 
                  required 
                  class="glass-input" 
                  placeholder="5"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Estoque Máximo</label>
                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="formData.max_stock" 
                  name="max_stock" 
                  class="glass-input" 
                  placeholder="100"
                />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeFormModal()">Cancelar</button>
              <button type="submit" class="btn btn-royal">
                {{ editingProductId ? 'Salvar Alterações' : 'Cadastrar Produto' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Quick Movement Row Modal -->
      <div *ngIf="showQuickModal()" class="modal-backdrop" (click)="closeQuickModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ quickType === 'IN' ? 'Entrada Rapida de Estoque' : 'Saida Rapida de Estoque' }}
            </h3>
            <button class="modal-close-btn" (click)="closeQuickModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div *ngIf="selectedProductForAction" class="modal-product-summary">
            <div class="summary-sku">{{ selectedProductForAction.sku }}</div>
            <div class="summary-name">{{ selectedProductForAction.name }}</div>
            <div class="summary-stock">
              Saldo Atual: <strong>{{ selectedProductForAction.quantity }} {{ selectedProductForAction.unit_measure }}</strong>
            </div>
          </div>

          <form (ngSubmit)="submitQuickAction()" class="modal-form">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Quantidade a Movimentar *</label>
                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="quickQty" 
                  name="quickQty" 
                  required 
                  class="glass-input font-bold" 
                  placeholder="Ex: 5"
                />
              </div>

              <div class="form-group">
                <label class="form-label">N Documento / Pedido</label>
                <input 
                  type="text" 
                  [(ngModel)]="quickDoc" 
                  name="quickDoc" 
                  class="glass-input" 
                  placeholder="Ex: NF-5510 / OS-12"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo da Operacao *</label>
              <input 
                type="text" 
                [(ngModel)]="quickReason" 
                name="quickReason" 
                required 
                class="glass-input" 
                placeholder="Ex: Chegada de fornecedor / Saida de venda balcao"
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeQuickModal()">Cancelar</button>
              <button 
                type="submit" 
                class="btn"
                [ngClass]="quickType === 'IN' ? 'btn-success' : 'btn-danger'"
              >
                Confirmar {{ quickType === 'IN' ? 'Entrada' : 'Saida' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="showDetailModal()" class="modal-backdrop" (click)="closeDetailModal()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="sku-tag">{{ activeDetailProduct?.sku }}</span>
              <h3 class="modal-title" style="margin-top: 6px;">{{ activeDetailProduct?.name }}</h3>
            </div>
            <button class="modal-close-btn" (click)="closeDetailModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div *ngIf="activeDetailProduct" class="detail-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Categoria</span>
                <span class="detail-val">{{ activeDetailProduct.category_name || 'Geral' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fornecedor</span>
                <span class="detail-val">{{ activeDetailProduct.supplier_name || 'Não associado' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Localização</span>
                <span class="detail-val">{{ activeDetailProduct.location || 'Depósito Central' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Saldo em Armazém</span>
                <span class="detail-val font-bold" [ngClass]="activeDetailProduct.quantity <= 0 ? 'text-rose' : 'text-cream'">
                  {{ activeDetailProduct.quantity }} {{ activeDetailProduct.unit_measure }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Custo Unitário</span>
                <span class="detail-val">{{ activeDetailProduct.cost_price | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Preço de Venda</span>
                <span class="detail-val currency-cream">{{ activeDetailProduct.selling_price | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Valor Total Imobilizado</span>
                <span class="detail-val">{{ activeDetailProduct.total_cost_value | currency:'BRL':'symbol':'1.2-2' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Margem Bruta Estimada</span>
                <span class="detail-val text-emerald font-bold">+{{ activeDetailProduct.margin_percentage }}%</span>
              </div>
            </div>

            <div *ngIf="activeDetailProduct.description" class="detail-desc-box">
              <div class="detail-label">Descrição Técnica</div>
              <p>{{ activeDetailProduct.description }}</p>
            </div>

            <!-- Movimentações Recentes deste Produto -->
            <div class="product-history-box">
              <h4 class="history-title">Histórico de Auditoria do Produto</h4>
              <div class="table-responsive">
                <table class="glass-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Qtd</th>
                      <th>Anterior → Novo</th>
                      <th>Motivo</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let m of productMovements">
                      <td>
                        <span 
                          class="badge" 
                          [ngClass]="m.movement_type === 'IN' ? 'badge-normal' : 'badge-out'"
                        >
                          {{ m.movement_type === 'IN' ? 'ENTRADA' : 'SAÍDA' }}
                        </span>
                      </td>
                      <td class="font-mono font-bold">
                        {{ m.movement_type === 'IN' ? '+' : '-' }}{{ m.quantity }}
                      </td>
                      <td class="font-mono text-cream-muted">
                        {{ m.previous_stock }} → {{ m.new_stock }}
                      </td>
                      <td>{{ m.reason }}</td>
                      <td class="text-xs text-cream-muted">{{ m.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                    </tr>
                    <tr *ngIf="productMovements.length === 0">
                      <td colspan="5" class="table-empty">Nenhuma movimentação registrada para este item.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dispatch to Delivery Site Modal -->
      <div *ngIf="showDispatchModal()" class="modal-backdrop" (click)="closeDispatchModal()">
        <div class="modal-dialog modal-md" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="sku-tag">{{ dispatchProduct?.sku }}</span>
              <h3 class="modal-title" style="margin-top: 4px;">Despachar para Site de Entregas</h3>
            </div>
            <button class="modal-close-btn" (click)="closeDispatchModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Se já despachou com sucesso, exibe o link direto do site de entregas -->
          <div *ngIf="lastGeneratedDelivery" class="modal-form">
            <div class="delivery-success-card">
              <div class="success-header">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h4>Despacho Confirmado com Sucesso!</h4>
              </div>
              <p class="delivery-info-text">
                O estoque foi atualizado automaticamente e o código de rastreamento foi gerado para a transportadora <strong>{{ lastGeneratedDelivery.carrier_display || lastGeneratedDelivery.carrier }}</strong>.
              </p>
              <div class="tracking-box">
                <span class="tracking-label">Código de Rastreamento:</span>
                <span class="tracking-code-val">{{ lastGeneratedDelivery.tracking_code }}</span>
              </div>
              <div class="delivery-actions">
                <a 
                  *ngIf="lastGeneratedDelivery.external_delivery_url" 
                  [href]="lastGeneratedDelivery.external_delivery_url" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="btn btn-royal btn-tracking-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>Acompanhar no Site de Entregas</span>
                </a>
                <button type="button" class="btn btn-glass" (click)="closeDispatchModal()">Concluir</button>
              </div>
            </div>
          </div>

          <!-- Formulário de Despacho -->
          <form *ngIf="!lastGeneratedDelivery" (ngSubmit)="submitDispatch()" class="modal-form">
            <div class="modal-product-summary">
              <div class="summary-sku">{{ dispatchProduct?.sku }}</div>
              <div class="summary-name">{{ dispatchProduct?.name }}</div>
              <div class="summary-stock">
                Saldo disponível: <strong>{{ dispatchProduct?.quantity }} {{ dispatchProduct?.unit_measure }}</strong>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Transportadora / Parceiro *</label>
                <select [(ngModel)]="dispatchCarrier" name="carrier" required class="glass-input">
                  <option value="CORREIOS">Correios (SEDEX / PAC)</option>
                  <option value="LOGGI">Loggi Express</option>
                  <option value="MELHOR_ENVIO">Melhor Envio</option>
                  <option value="JADLOG">Jadlog Logística</option>
                  <option value="EXPRESS">Entrega Expressa Própria</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Quantidade a Despachar *</label>
                <input 
                  type="number" 
                  min="1" 
                  [max]="dispatchProduct?.quantity || 1"
                  [(ngModel)]="dispatchQty" 
                  name="quantity" 
                  required 
                  class="glass-input" 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nome do Destinatário *</label>
              <input 
                type="text" 
                [(ngModel)]="dispatchRecipientName" 
                name="recipientName" 
                required 
                class="glass-input" 
                placeholder="Ex: Empresa Exemplo Ltda / João Silva"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Endereço Completo de Entrega *</label>
              <input 
                type="text" 
                [(ngModel)]="dispatchRecipientAddress" 
                name="recipientAddress" 
                required 
                class="glass-input" 
                placeholder="Ex: Av. Paulista, 1000, Bela Vista - São Paulo/SP"
              />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  [(ngModel)]="dispatchRecipientPhone" 
                  name="recipientPhone" 
                  class="glass-input" 
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Valor do Frete (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  [(ngModel)]="dispatchShippingCost" 
                  name="shippingCost" 
                  class="glass-input" 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeDispatchModal()">Cancelar</button>
              <button type="submit" class="btn btn-royal">
                Despachar & Gerar Rastreio
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Archive Confirmation Modal -->
      <div *ngIf="showArchiveModal()" class="modal-backdrop" (click)="closeArchiveModal()">
        <div class="modal-dialog modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Arquivar Item</h3>
            <button class="modal-close-btn" (click)="closeArchiveModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-form">
            <p class="archive-warning-text">
              O produto <strong>{{ archiveProductTarget?.name }}</strong> (SKU: {{ archiveProductTarget?.sku }}) será arquivado. Ele deixará de constar no catálogo ativo, mas todos os históricos contábeis e auditorias serão preservados e poderão ser consultados ou reativados a qualquer momento.
            </p>

            <div class="form-group" style="margin-top: 14px;">
              <label class="form-label">Motivo do Arquivamento</label>
              <input 
                type="text" 
                [(ngModel)]="archiveReason" 
                class="glass-input" 
                placeholder="Ex: Descontinuado pelo fabricante / Fim de linha"
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeArchiveModal()">Cancelar</button>
              <button type="button" class="btn btn-danger" (click)="submitArchive()">
                Confirmar Arquivamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-page {
      padding: 32px 36px;
      max-width: 1440px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
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
    .page-desc {
      font-size: 0.94rem;
      color: var(--cream-300);
      margin-top: 6px;
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
      width: 200px;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .pill-low.active {
      background: rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }
    .pill-out.active {
      background: rgba(244, 63, 94, 0.3);
      color: #fb7185;
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
      font-size: 0.95rem;
    }

    /* Cells */
    .prod-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .prod-name-clickable {
      font-weight: 700;
      color: var(--cream-50);
      cursor: pointer;
      transition: color 0.15s;
    }
    .prod-name-clickable:hover {
      color: var(--royal-300);
      text-decoration: underline;
    }
    .prod-location {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--cream-400);
    }
    .sku-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .barcode-sub {
      font-size: 0.72rem;
      color: rgba(235, 224, 198, 0.45);
      font-family: var(--font-mono);
    }
    .price-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .price-cost {
      font-size: 0.75rem;
      color: var(--cream-400);
    }
    .price-sell {
      font-weight: 700;
      font-size: 0.92rem;
    }
    .price-margin {
      font-size: 0.72rem;
    }
    .stock-cell {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 110px;
    }
    .stock-numbers {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .stock-qty {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 0.95rem;
    }
    .stock-minmax {
      font-size: 0.72rem;
      color: var(--cream-400);
    }
    .stock-gauge-bg {
      height: 5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .stock-gauge-fill {
      height: 100%;
      border-radius: 999px;
    }
    .bg-emerald { background: #10b981; }
    .bg-warn { background: #f59e0b; }
    .bg-rose { background: #f43f5e; }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
    .action-btn {
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .action-btn.in-btn {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .action-btn.in-btn:hover {
      background: rgba(16, 185, 129, 0.3);
      color: #fff;
    }
    .action-btn.out-btn {
      background: rgba(244, 63, 94, 0.15);
      color: #fb7185;
      border-color: rgba(244, 63, 94, 0.3);
    }
    .action-btn.out-btn:hover {
      background: rgba(244, 63, 94, 0.3);
      color: #fff;
    }
    .action-btn.dispatch-btn {
      background: rgba(48, 98, 234, 0.2);
      color: var(--cream-100);
      border-color: rgba(77, 124, 254, 0.4);
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .action-btn.dispatch-btn:hover:not(:disabled) {
      background: rgba(48, 98, 234, 0.45);
      color: #fff;
      border-color: rgba(77, 124, 254, 0.7);
    }
    .action-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .icon-action-btn {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--cream-300);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      transition: all 0.15s;
    }
    .icon-action-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .icon-action-btn.danger-action:hover {
      background: rgba(244, 63, 94, 0.25);
      border-color: rgba(244, 63, 94, 0.4);
      color: #fb7185;
    }

    /* Modals */
    .modal-lg {
      max-width: 800px;
    }
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
    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
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
    .modal-product-summary {
      background: rgba(6, 13, 33, 0.6);
      border: 1px solid rgba(235, 224, 198, 0.14);
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .summary-sku {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--cream-300);
    }
    .summary-name {
      font-weight: 700;
      font-size: 1.05rem;
      color: var(--cream-50);
      margin: 2px 0 6px 0;
    }
    .summary-stock {
      font-size: 0.85rem;
      color: var(--cream-300);
    }

    /* Detail Modal Specific */
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      background: rgba(8, 17, 44, 0.5);
      border: 1px solid rgba(235, 224, 198, 0.12);
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 20px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--cream-400);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .detail-val {
      font-size: 0.92rem;
      color: var(--cream-100);
    }
    .detail-desc-box {
      background: rgba(8, 17, 44, 0.4);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
      font-size: 0.88rem;
      color: var(--cream-200);
      line-height: 1.5;
    }
    .history-title {
      font-size: 1rem;
      color: var(--cream-50);
      margin-bottom: 12px;
    }

    /* Delivery & Tracking & Archive Styles */
    .delivery-success-card {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .success-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .success-header h4 {
      margin: 0;
      font-size: 1.1rem;
      color: #34d399;
      font-weight: 700;
    }
    .delivery-info-text {
      font-size: 0.88rem;
      color: var(--cream-200);
      line-height: 1.5;
      margin: 0;
    }
    .tracking-box {
      background: rgba(4, 9, 24, 0.7);
      border: 1px dashed rgba(235, 224, 198, 0.25);
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .tracking-label {
      font-size: 0.82rem;
      color: var(--cream-300);
      font-weight: 600;
    }
    .tracking-code-val {
      font-family: var(--font-mono);
      font-size: 1.05rem;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.08em;
    }
    .delivery-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 6px;
    }
    .btn-tracking-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .archive-warning-text {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--cream-200);
      margin: 0;
    }

    @media (max-width: 900px) {
      .form-grid-3, .form-grid-2, .detail-grid {
        grid-template-columns: 1fr;
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
export class ProductListComponent implements OnInit {
  inventoryService = inject(InventoryService);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);

  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';

  // Modals state
  showFormModal = signal<boolean>(false);
  editingProductId: number | null = null;
  formData: Partial<Product> = this.getEmptyProduct();

  showQuickModal = signal<boolean>(false);
  selectedProductForAction: Product | null = null;
  quickType: 'IN' | 'OUT' = 'IN';
  quickQty: number = 1;
  quickDoc: string = '';
  quickReason: string = '';

  showDetailModal = signal<boolean>(false);
  activeDetailProduct: Product | null = null;
  productMovements: StockMovement[] = [];

  // View mode filter (Ativos / Arquivados / Todos)
  viewMode: 'ACTIVE' | 'ARCHIVED' | 'ALL' = 'ACTIVE';

  // Dispatch to Delivery Partner modal
  showDispatchModal = signal<boolean>(false);
  dispatchProduct: Product | null = null;
  dispatchCarrier: DeliveryCarrier = 'CORREIOS';
  dispatchRecipientName = '';
  dispatchRecipientAddress = '';
  dispatchRecipientPhone = '';
  dispatchQty = 1;
  dispatchShippingCost = 0;
  lastGeneratedDelivery: DeliveryOrder | null = null;

  // Archive modal
  showArchiveModal = signal<boolean>(false);
  archiveProductTarget: Product | null = null;
  archiveReason = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
      }
      if (params['status']) {
        this.selectedStatus = params['status'];
      }
      if (params['modal'] === 'new') {
        this.openCreateModal();
      }
    });
  }

  getEmptyProduct(): Partial<Product> {
    return {
      sku: '',
      barcode: '',
      name: '',
      description: '',
      category: null,
      supplier: null,
      unit_measure: 'UN' as UnitMeasure,
      cost_price: 0,
      selling_price: 0,
      quantity: 1,
      min_stock: 5,
      max_stock: 100,
      location: 'Depósito Central - Estante A1'
    };
  }

  totalCount(): number {
    return this.inventoryService.products().length;
  }

  activeCount(): number {
    return this.inventoryService.products().filter(p => !p.is_archived).length;
  }

  archivedCount(): number {
    return this.inventoryService.products().filter(p => !!p.is_archived).length;
  }

  lowCount(): number {
    return this.inventoryService.products().filter(p => !p.is_archived && p.quantity > 0 && p.quantity <= p.min_stock).length;
  }

  outCount(): number {
    return this.inventoryService.products().filter(p => !p.is_archived && p.quantity <= 0).length;
  }

  setViewMode(mode: 'ACTIVE' | 'ARCHIVED' | 'ALL') {
    this.viewMode = mode;
  }

  filteredProducts(): Product[] {
    let prods = this.inventoryService.products();

    if (this.viewMode === 'ACTIVE') {
      prods = prods.filter(p => !p.is_archived);
    } else if (this.viewMode === 'ARCHIVED') {
      prods = prods.filter(p => !!p.is_archived);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    if (this.selectedCategory) {
      prods = prods.filter(p => p.category === Number(this.selectedCategory));
    }

    if (this.selectedStatus && this.viewMode !== 'ARCHIVED') {
      prods = prods.filter(p => p.stock_status === this.selectedStatus);
    }

    return prods;
  }

  applyFilters() {
    // Reatividade garantida via signal filteredProducts()
  }

  setStatusFilter(status: string) {
    this.selectedStatus = status;
  }

  getStockGauge(p: Product): number {
    const max = p.max_stock || 100;
    return Math.min(100, Math.round((p.quantity / max) * 100));
  }

  // --- FORM MODAL ---
  openCreateModal() {
    this.editingProductId = null;
    this.formData = this.getEmptyProduct();
    const cats = this.inventoryService.categories();
    if (cats.length > 0) this.formData.category = cats[0].id;
    this.showFormModal.set(true);
  }

  openEditModal(p: Product) {
    this.editingProductId = p.id;
    this.formData = { ...p };
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
  }

  saveProduct() {
    if (!this.formData.sku || !this.formData.name) {
      this.toast.error('Preencha ao menos o SKU e o Nome do Produto.');
      return;
    }

    if (this.editingProductId) {
      this.inventoryService.updateProduct(this.editingProductId, this.formData).subscribe({
        next: () => {
          this.toast.success('Produto atualizado com sucesso!');
          this.closeFormModal();
        },
        error: (err) => this.toast.error(err.message || 'Erro ao atualizar produto')
      });
    } else {
      this.inventoryService.createProduct(this.formData).subscribe({
        next: () => {
          this.toast.success('Produto cadastrado com sucesso!');
          this.closeFormModal();
        },
        error: (err) => this.toast.error(err.message || 'Erro ao cadastrar produto')
      });
    }
  }

  confirmDelete(p: Product) {
    if (confirm(`Deseja realmente remover o produto ${p.name} (SKU: ${p.sku})?`)) {
      this.inventoryService.deleteProduct(p.id).subscribe({
        next: () => this.toast.info(`Produto ${p.sku} removido`),
        error: () => this.toast.error('Erro ao excluir produto')
      });
    }
  }

  // --- QUICK MOVEMENT ROW ---
  openQuickModal(p: Product, type: 'IN' | 'OUT') {
    this.selectedProductForAction = p;
    this.quickType = type;
    this.quickQty = 1;
    this.quickDoc = '';
    this.quickReason = type === 'IN' ? 'Entrada rápida de mercadoria' : 'Saída rápida / Venda';
    this.showQuickModal.set(true);
  }

  closeQuickModal() {
    this.showQuickModal.set(false);
  }

  submitQuickAction() {
    if (!this.selectedProductForAction) return;

    this.inventoryService.quickMovement(this.selectedProductForAction.id, {
      movement_type: this.quickType,
      quantity: Number(this.quickQty),
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

  // --- DETAIL MODAL ---
  openDetailModal(p: Product) {
    this.activeDetailProduct = p;
    this.productMovements = this.inventoryService.movements().filter(m => m.product === p.id);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
  }

  // --- DISPATCH TO DELIVERY SITE MODAL ---
  openDispatchModal(p: Product) {
    this.dispatchProduct = p;
    this.dispatchCarrier = 'CORREIOS';
    this.dispatchRecipientName = '';
    this.dispatchRecipientAddress = '';
    this.dispatchRecipientPhone = '';
    this.dispatchQty = 1;
    this.dispatchShippingCost = 0;
    this.lastGeneratedDelivery = null;
    this.showDispatchModal.set(true);
  }

  closeDispatchModal() {
    this.showDispatchModal.set(false);
    this.lastGeneratedDelivery = null;
  }

  submitDispatch() {
    if (!this.dispatchProduct) return;

    if (!this.dispatchRecipientName.trim() || !this.dispatchRecipientAddress.trim()) {
      this.toast.error('Informe o nome e o endereço completo de entrega.');
      return;
    }

    this.inventoryService.dispatchDelivery(this.dispatchProduct.id, {
      carrier: this.dispatchCarrier,
      quantity: Number(this.dispatchQty),
      recipient_name: this.dispatchRecipientName.trim(),
      recipient_address: this.dispatchRecipientAddress.trim(),
      recipient_phone: this.dispatchRecipientPhone.trim(),
      shipping_cost: Number(this.dispatchShippingCost || 0)
    }).subscribe({
      next: (res) => {
        this.lastGeneratedDelivery = res;
        this.toast.success('Despacho registrado e código de rastreamento gerado!');
      },
      error: (err) => {
        this.toast.error(err.message || 'Erro ao realizar despacho de entrega');
      }
    });
  }

  // --- ARCHIVE / UNARCHIVE ---
  openArchiveModal(p: Product) {
    this.archiveProductTarget = p;
    this.archiveReason = '';
    this.showArchiveModal.set(true);
  }

  closeArchiveModal() {
    this.showArchiveModal.set(false);
    this.archiveProductTarget = null;
  }

  submitArchive() {
    if (!this.archiveProductTarget) return;

    this.inventoryService.archiveProduct(this.archiveProductTarget.id, this.archiveReason).subscribe({
      next: () => {
        this.toast.success(`Produto ${this.archiveProductTarget?.sku} arquivado com sucesso.`);
        this.closeArchiveModal();
      },
      error: (err) => {
        this.toast.error(err.message || 'Erro ao arquivar produto');
      }
    });
  }

  unarchive(p: Product) {
    this.inventoryService.unarchiveProduct(p.id).subscribe({
      next: () => {
        this.toast.success(`Produto ${p.sku} reativado no catálogo com sucesso!`);
      },
      error: (err) => {
        this.toast.error(err.message || 'Erro ao reativar produto');
      }
    });
  }
}

