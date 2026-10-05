import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductListComponent } from './features/products/product-list.component';
import { MovementListComponent } from './features/movements/movement-list.component';
import { CategorySupplierComponent } from './features/categories/category-supplier.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'DreamStorage | Painel de Controle' },
  { path: 'produtos', component: ProductListComponent, title: 'DreamStorage | Catalogo de Produtos' },
  { path: 'movimentacoes', component: MovementListComponent, title: 'DreamStorage | Movimentacoes de Estoque' },
  { path: 'categorias', component: CategorySupplierComponent, title: 'DreamStorage | Categorias & Fornecedores' },
  { path: 'perfil', component: ProfileComponent, title: 'DreamStorage | Perfil & Controle' },
  { path: '**', redirectTo: '' }
];


