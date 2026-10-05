export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  products_count?: number;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  cnpj_cpf: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  products_count?: number;
  created_at?: string;
}

export type StockStatus = 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type UnitMeasure = 'UN' | 'CX' | 'PC' | 'KG' | 'MT' | 'LT' | 'PAR' | 'KIT';

export interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: number | null;
  category_name?: string;
  category_color?: string;
  supplier?: number | null;
  supplier_name?: string;
  unit_measure: UnitMeasure;
  cost_price: number | string;
  selling_price: number | string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  location?: string;
  is_active: boolean;
  stock_status?: StockStatus;
  total_cost_value?: number;
  total_selling_value?: number;
  margin_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export interface StockMovement {
  id: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  product_unit?: string;
  movement_type: MovementType;
  movement_type_display?: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost?: number | string;
  total_value?: number | string;
  reason: string;
  reference_doc?: string;
  performed_by: string;
  notes?: string;
  created_at: string;
}

export interface StockAlert {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  current_quantity: number;
  min_stock: number;
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  total_products: number;
  total_stock_units: number;
  total_inventory_cost: number;
  total_inventory_selling: number;
  potential_profit: number;
  out_of_stock_count: number;
  low_stock_count: number;
  healthy_stock_count: number;
  total_categories: number;
  total_suppliers: number;
  month_in_units: number;
  month_out_units: number;
}

export interface CategoryDistribution {
  id: number;
  name: string;
  color: string;
  items_count: number;
  total_units: number;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  recent_movements: StockMovement[];
  critical_products: Product[];
  categories_distribution: CategoryDistribution[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}
