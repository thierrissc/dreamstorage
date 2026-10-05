import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductListComponent } from './features/products/product-list.component';
import { MovementListComponent } from './features/movements/movement-list.component';
import { CategorySupplierComponent } from './features/categories/category-supplier.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'DreamStorage | Painel de Controle' },
  { path: 'produtos', component: ProductListComponent, title: 'DreamStorage | Catálogo de Produtos' },
  { path: 'movimentacoes', component: MovementListComponent, title: 'DreamStorage | Movimentações de Estoque' },
  { path: 'categorias', component: CategorySupplierComponent, title: 'DreamStorage | Categorias & Fornecedores' },
  { path: '**', redirectTo: '' }
];

