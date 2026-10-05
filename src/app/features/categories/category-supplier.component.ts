import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { Category, Supplier } from '../../models/inventory.models';

@Component({
  selector: 'app-category-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cat-sup-page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <div class="welcome-tag">ORGANIZAÇÃO & CADEIA DE SUPRIMENTOS</div>
          <h1 class="page-title">Categorias & Fornecedores</h1>
          <p class="page-desc">Taxonomia de produtos e cadastro corporativo de fornecedores homologados.</p>
        </div>
        <div class="header-actions">
          <button *ngIf="activeTab === 'categories'" class="btn btn-cream" (click)="openCategoryModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nova Categoria</span>
          </button>
          <button *ngIf="activeTab === 'suppliers'" class="btn btn-cream" (click)="openSupplierModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Novo Fornecedor</span>
          </button>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="tabs-container">
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'categories'"
          (click)="activeTab = 'categories'"
        >
          Categorias de Produtos ({{ inventoryService.categories().length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab === 'suppliers'"
          (click)="activeTab = 'suppliers'"
        >
          Fornecedores Homologados ({{ inventoryService.suppliers().length }})
        </button>
      </div>

      <!-- CATEGORIES VIEW -->
      <div *ngIf="activeTab === 'categories'" class="categories-grid">
        <div *ngFor="let cat of inventoryService.categories()" class="liquid-glass-card cat-card">
          <div class="cat-header">
            <div class="cat-badge-wrap">
              <span class="cat-dot" [style.background]="cat.color"></span>
              <h3 class="cat-title">{{ cat.name }}</h3>
            </div>
            <span class="badge badge-category">{{ cat.products_count || 0 }} produtos</span>
          </div>

          <p class="cat-desc">{{ cat.description || 'Sem descricao cadastrada.' }}</p>

          <div class="cat-footer">
            <span class="cat-slug font-mono">/{{ cat.slug }}</span>
            <div class="color-preview" [style.background]="cat.color" title="Cor identificadora"></div>
          </div>
        </div>
      </div>

      <!-- SUPPLIERS VIEW -->
      <div *ngIf="activeTab === 'suppliers'" class="suppliers-grid">
        <div *ngFor="let sup of inventoryService.suppliers()" class="liquid-glass-card sup-card">
          <div class="sup-header">
            <div>
              <h3 class="sup-name">{{ sup.name }}</h3>
              <span *ngIf="sup.cnpj_cpf" class="sup-cnpj font-mono">{{ sup.cnpj_cpf }}</span>
            </div>
            <span class="badge badge-cream">{{ sup.products_count || 0 }} itens</span>
          </div>

          <div class="sup-info-list">
            <div *ngIf="sup.contact_person" class="sup-info-item">
              <span class="info-label">Contato:</span>
              <span class="info-val">{{ sup.contact_person }}</span>
            </div>
            <div *ngIf="sup.email" class="sup-info-item">
              <span class="info-label">E-mail:</span>
              <span class="info-val font-mono">{{ sup.email }}</span>
            </div>
            <div *ngIf="sup.phone" class="sup-info-item">
              <span class="info-label">Telefone:</span>
              <span class="info-val font-mono">{{ sup.phone }}</span>
            </div>
            <div *ngIf="sup.address" class="sup-info-item">
              <span class="info-label">Endereco:</span>
              <span class="info-val text-xs">{{ sup.address }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- New Category Modal -->
      <div *ngIf="showCategoryModal()" class="modal-backdrop" (click)="closeCategoryModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Cadastrar Categoria</h3>
            <button class="modal-close-btn" (click)="closeCategoryModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveCategory()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Nome da Categoria *</label>
              <input 
                type="text" 
                [(ngModel)]="catForm.name" 
                name="name" 
                required 
                class="glass-input" 
                placeholder="Ex: Dispositivos de Fibra Optica"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descricao</label>
              <textarea 
                [(ngModel)]="catForm.description" 
                name="description" 
                rows="2" 
                class="glass-input" 
                placeholder="Finalidade desta categoria..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Cor Identificadora *</label>
              <div class="color-picker-row">
                <input 
                  type="color" 
                  [(ngModel)]="catForm.color" 
                  name="color" 
                  class="color-input" 
                />
                <input 
                  type="text" 
                  [(ngModel)]="catForm.color" 
                  name="color_text" 
                  class="glass-input font-mono" 
                  style="width: 130px;"
                />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeCategoryModal()">Cancelar</button>
              <button type="submit" class="btn btn-royal">Criar Categoria</button>
            </div>
          </form>
        </div>
      </div>

      <!-- New Supplier Modal -->
      <div *ngIf="showSupplierModal()" class="modal-backdrop" (click)="closeSupplierModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Cadastrar Fornecedor</h3>
            <button class="modal-close-btn" (click)="closeSupplierModal()" aria-label="Fechar modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveSupplier()" class="modal-form">
            <div class="form-group">
              <label class="form-label">Razão Social / Nome da Empresa *</label>
              <input 
                type="text" 
                [(ngModel)]="supForm.name" 
                name="name" 
                required 
                class="glass-input" 
                placeholder="Ex: Synapse Tech Distribuição"
              />
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">CNPJ / CPF</label>
                <input 
                  type="text" 
                  [(ngModel)]="supForm.cnpj_cpf" 
                  name="cnpj" 
                  class="glass-input font-mono" 
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Representante / Contato</label>
                <input 
                  type="text" 
                  [(ngModel)]="supForm.contact_person" 
                  name="contact" 
                  class="glass-input" 
                  placeholder="Ex: Carlos Eduardo"
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">E-mail</label>
                <input 
                  type="email" 
                  [(ngModel)]="supForm.email" 
                  name="email" 
                  class="glass-input font-mono" 
                  placeholder="vendas@empresa.com"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Telefone / WhatsApp</label>
                <input 
                  type="text" 
                  [(ngModel)]="supForm.phone" 
                  name="phone" 
                  class="glass-input font-mono" 
                  placeholder="(11) 98765-4321"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Endereço Comercial</label>
              <input 
                type="text" 
                [(ngModel)]="supForm.address" 
                name="address" 
                class="glass-input" 
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-glass" (click)="closeSupplierModal()">Cancelar</button>
              <button type="submit" class="btn btn-royal">Cadastrar Fornecedor</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cat-sup-page {
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

    /* Tabs */
    .tabs-container {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid rgba(235, 224, 198, 0.12);
      padding-bottom: 8px;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--cream-300);
      font-size: 0.95rem;
      font-weight: 700;
      font-family: var(--font-heading);
      padding: 10px 18px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-btn.active {
      color: var(--cream-50);
      background: rgba(48, 98, 234, 0.35);
      border: 1px solid rgba(74, 124, 245, 0.4);
      box-shadow: 0 4px 16px rgba(48, 98, 234, 0.25);
    }

    /* Grids */
    .categories-grid, .suppliers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    /* Category Card */
    .cat-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
    }
    .cat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cat-badge-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cat-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .cat-title {
      font-size: 1.1rem;
      color: var(--cream-50);
    }
    .cat-desc {
      font-size: 0.85rem;
      color: var(--cream-300);
      line-height: 1.4;
    }
    .cat-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 12px;
    }
    .cat-slug {
      font-size: 0.76rem;
      color: var(--cream-400);
    }
    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    /* Supplier Card */
    .sup-card {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .sup-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .sup-name {
      font-size: 1.05rem;
      color: var(--cream-50);
    }
    .sup-cnpj {
      font-size: 0.74rem;
      color: var(--cream-400);
      display: block;
      margin-top: 3px;
    }
    .sup-info-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 12px;
    }
    .sup-info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
    }
    .info-label {
      color: var(--cream-400);
      font-weight: 600;
      min-width: 60px;
    }
    .info-val {
      color: var(--cream-100);
    }

    /* Modals */
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
    .color-picker-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .color-input {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 1px solid var(--glass-border);
      background: none;
      cursor: pointer;
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

    .font-mono { font-family: var(--font-mono); }
    .text-xs { font-size: 0.76rem; }

    @media (max-width: 768px) {
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategorySupplierComponent {
  inventoryService = inject(InventoryService);
  toast = inject(ToastService);

  activeTab: 'categories' | 'suppliers' = 'categories';

  showCategoryModal = signal<boolean>(false);
  catForm: Partial<Category> = { name: '', description: '', color: '#2563eb' };

  showSupplierModal = signal<boolean>(false);
  supForm: Partial<Supplier> = { name: '', cnpj_cpf: '', contact_person: '', email: '', phone: '', address: '' };

  openCategoryModal() {
    this.catForm = { name: '', description: '', color: '#3062ea' };
    this.showCategoryModal.set(true);
  }
  closeCategoryModal() {
    this.showCategoryModal.set(false);
  }
  saveCategory() {
    if (!this.catForm.name) {
      this.toast.error('Informe o nome da categoria.');
      return;
    }
    this.inventoryService.createCategory(this.catForm).subscribe({
      next: () => {
        this.toast.success('Categoria criada com sucesso!');
        this.closeCategoryModal();
      },
      error: () => this.toast.error('Erro ao criar categoria')
    });
  }

  openSupplierModal() {
    this.supForm = { name: '', cnpj_cpf: '', contact_person: '', email: '', phone: '', address: '' };
    this.showSupplierModal.set(true);
  }
  closeSupplierModal() {
    this.showSupplierModal.set(false);
  }
  saveSupplier() {
    if (!this.supForm.name) {
      this.toast.error('Informe o nome do fornecedor.');
      return;
    }
    this.inventoryService.createSupplier(this.supForm).subscribe({
      next: () => {
        this.toast.success('Fornecedor cadastrado com sucesso!');
        this.closeSupplierModal();
      },
      error: () => this.toast.error('Erro ao cadastrar fornecedor')
    });
  }
}
