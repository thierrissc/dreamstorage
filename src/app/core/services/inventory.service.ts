import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import {
  Product,
  Category,
  Supplier,
  StockMovement,
  StockAlert,
  DashboardOverview,
  DeliveryOrder,
  DeliveryStatus
} from '../../models/inventory.models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = 'http://localhost:8000/api/inventory';

  // Signals para reatividade instantânea em toda a interface
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);
  movements = signal<StockMovement[]>([]);
  alerts = signal<StockAlert[]>([]);
  deliveries = signal<DeliveryOrder[]>([]);
  dashboardData = signal<DashboardOverview | null>(null);
  isLoading = signal<boolean>(false);

  // Dados mockados de alta fidelidade para fallback
  private mockCategories: Category[] = [
    { id: 1, name: 'Servidores & Datacenter', slug: 'servidores-datacenter', description: 'Servidores rack e fontes redundantes', color: '#1d4ed8', icon: 'server', products_count: 2 },
    { id: 2, name: 'Redes & Infraestrutura', slug: 'redes-infraestrutura', description: 'Switches gerenciáveis e roteadores', color: '#2563eb', icon: 'wifi', products_count: 3 },
    { id: 3, name: 'Componentes & Memórias', slug: 'componentes-memorias', description: 'Processadores e memórias ECC DDR5', color: '#3b82f6', icon: 'cpu', products_count: 2 },
    { id: 4, name: 'Periféricos & Estações', slug: 'perifericos-estacoes', description: 'Monitores calibrados e teclados', color: '#60a5fa', icon: 'monitor', products_count: 2 },
    { id: 5, name: 'Cabos & Conectividade', slug: 'cabos-conectividade', description: 'Cabos ópticos OM4 e transceivers SFP+', color: '#93c5fd', icon: 'link', products_count: 2 },
  ];

  private mockSuppliers: Supplier[] = [
    { id: 1, name: 'Synapse Tech Soluções Globais', cnpj_cpf: '12.345.678/0001-90', contact_person: 'Ricardo Alcantara', email: 'contato@synapsetech.com.br', phone: '(11) 3456-7890', address: 'Av. Brigadeiro Faria Lima, 2000 - SP', products_count: 2 },
    { id: 2, name: 'Quantum Hardware Distribuidora', cnpj_cpf: '98.765.432/0001-11', contact_person: 'Mariana Esteves', email: 'vendas@quantumhardware.com.br', phone: '(19) 3211-9988', address: 'Rodovia Dom Pedro I, Campinas - SP', products_count: 2 },
    { id: 3, name: 'Nexus Fibra & Redes do Brasil', cnpj_cpf: '45.123.789/0001-55', contact_person: 'Carlos Eduardo Duarte', email: 'pedidos@nexusfibra.com', phone: '(21) 2555-1234', address: 'Rua Primeiro de Março, 80 - RJ', products_count: 5 },
    { id: 4, name: 'Apex Microchips & Armazenamento', cnpj_cpf: '77.888.999/0001-33', contact_person: 'Beatriz Ramos', email: 'comercial@apexstorage.com', phone: '(41) 3044-8800', address: 'Rua Marechal Deodoro, Curitiba - PR', products_count: 2 },
  ];

  private mockProducts: Product[] = [
    {
      id: 1,
      sku: 'SRV-PWR-R750',
      barcode: '7891000112231',
      name: 'Servidor PowerEdge R750 2U Rack Dual Xeon 64GB',
      category: 1,
      category_name: 'Servidores & Datacenter',
      category_color: '#1d4ed8',
      supplier: 1,
      supplier_name: 'Synapse Tech Soluções Globais',
      unit_measure: 'UN',
      cost_price: 28500.00,
      selling_price: 39900.00,
      quantity: 4,
      min_stock: 2,
      max_stock: 10,
      location: 'Rack Alpha - Setor S1',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 114000.00,
      total_selling_value: 159600.00,
      margin_percentage: 40.00,
      description: 'Servidor de missão crítica com 2x Xeon Silver 4314, 64GB RAM DDR4 ECC, controladora PERC H745.'
    },
    {
      id: 2,
      sku: 'SRV-HPE-DL380',
      barcode: '7891000112248',
      name: 'Servidor HPE ProLiant DL380 Gen10 Plus 2U',
      category: 1,
      category_name: 'Servidores & Datacenter',
      category_color: '#1d4ed8',
      supplier: 1,
      supplier_name: 'Synapse Tech Soluções Globais',
      unit_measure: 'UN',
      cost_price: 32000.00,
      selling_price: 44500.00,
      quantity: 1,
      min_stock: 2,
      max_stock: 8,
      location: 'Rack Alpha - Setor S2',
      is_active: true,
      stock_status: 'LOW_STOCK',
      total_cost_value: 32000.00,
      total_selling_value: 44500.00,
      margin_percentage: 39.06,
      description: 'Excelente para virtualização intensa, compatível com VMware vSphere e Proxmox VE.'
    },
    {
      id: 3,
      sku: 'SWT-CISCO-C9200L',
      barcode: '7891000223344',
      name: 'Switch Cisco Catalyst C9200L 48 Portas Gigabit PoE+',
      category: 2,
      category_name: 'Redes & Infraestrutura',
      category_color: '#2563eb',
      supplier: 3,
      supplier_name: 'Nexus Fibra & Redes do Brasil',
      unit_measure: 'UN',
      cost_price: 14200.00,
      selling_price: 19800.00,
      quantity: 6,
      min_stock: 3,
      max_stock: 20,
      location: 'Corredor B - Prateleira 4',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 85200.00,
      total_selling_value: 118800.00,
      margin_percentage: 39.44,
      description: 'Switch de camada 3 avançada com 4 uplinks 10G SFP+ e PoE full budget 740W.'
    },
    {
      id: 4,
      sku: 'RT-MIK-CCR2004',
      barcode: '7891000223351',
      name: 'Roteador MikroTik CCR2004-1G-12S+2XS Cloud Core',
      category: 2,
      category_name: 'Redes & Infraestrutura',
      category_color: '#2563eb',
      supplier: 3,
      supplier_name: 'Nexus Fibra & Redes do Brasil',
      unit_measure: 'UN',
      cost_price: 4800.00,
      selling_price: 6750.00,
      quantity: 8,
      min_stock: 4,
      max_stock: 25,
      location: 'Corredor B - Prateleira 2',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 38400.00,
      total_selling_value: 54000.00,
      margin_percentage: 40.63,
      description: 'Processador Annapurna Labs Alpine v2 com 4 núcleos 64-bit 1.7GHz e 12 portas 10G SFP+.'
    },
    {
      id: 5,
      sku: 'AP-UBI-U6PRO',
      barcode: '7891000223368',
      name: 'Access Point Ubiquiti UniFi 6 Pro WiFi 6 Dual-Band',
      category: 2,
      category_name: 'Redes & Infraestrutura',
      category_color: '#2563eb',
      supplier: 3,
      supplier_name: 'Nexus Fibra & Redes do Brasil',
      unit_measure: 'UN',
      cost_price: 1100.00,
      selling_price: 1650.00,
      quantity: 0,
      min_stock: 5,
      max_stock: 40,
      location: 'Corredor B - Prateleira 1',
      is_active: true,
      stock_status: 'OUT_OF_STOCK',
      total_cost_value: 0.00,
      total_selling_value: 0.00,
      margin_percentage: 50.00,
      description: 'Taxa de transferência agregada de até 5.3 Gbps em bandas 5 GHz e 2.4 GHz com MIMO 4x4.'
    },
    {
      id: 6,
      sku: 'SSD-NVME-S990PRO-2TB',
      barcode: '7891000334455',
      name: 'SSD NVMe M.2 Samsung 990 PRO 2TB PCIe 4.0 7450MB/s',
      category: 3,
      category_name: 'Componentes & Memórias',
      category_color: '#3b82f6',
      supplier: 4,
      supplier_name: 'Apex Microchips & Armazenamento',
      unit_measure: 'UN',
      cost_price: 1150.00,
      selling_price: 1690.00,
      quantity: 28,
      min_stock: 10,
      max_stock: 100,
      location: 'Cofre Componentes - Gaveta 3',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 32200.00,
      total_selling_value: 47320.00,
      margin_percentage: 46.96,
      description: 'Velocidade de leitura sequencial de até 7.450 MB/s e gravação até 6.900 MB/s com DRAM LPDDR4.'
    },
    {
      id: 7,
      sku: 'RAM-KST-32GB-DDR5',
      barcode: '7891000334462',
      name: 'Memória Kingston Fury Beast 32GB (2x16GB) DDR5 6000MHz',
      category: 3,
      category_name: 'Componentes & Memórias',
      category_color: '#3b82f6',
      supplier: 4,
      supplier_name: 'Apex Microchips & Armazenamento',
      unit_measure: 'KIT',
      cost_price: 720.00,
      selling_price: 1099.00,
      quantity: 3,
      min_stock: 6,
      max_stock: 50,
      location: 'Cofre Componentes - Gaveta 1',
      is_active: true,
      stock_status: 'LOW_STOCK',
      total_cost_value: 2160.00,
      total_selling_value: 3297.00,
      margin_percentage: 52.64,
      description: 'Módulos de alta velocidade com perfis Intel XMP 3.0 e dissipador térmico em alumínio preto.'
    },
    {
      id: 8,
      sku: 'MON-DELL-U2723QE',
      barcode: '7891000445566',
      name: 'Monitor UltraSharp Dell 27" 4K IPS Black USB-C Hub',
      category: 4,
      category_name: 'Periféricos & Estações',
      category_color: '#60a5fa',
      supplier: 2,
      supplier_name: 'Quantum Hardware Distribuidora',
      unit_measure: 'UN',
      cost_price: 3800.00,
      selling_price: 5290.00,
      quantity: 12,
      min_stock: 3,
      max_stock: 25,
      location: 'Corredor D - Palete 2',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 45600.00,
      total_selling_value: 63480.00,
      margin_percentage: 39.21,
      description: 'Contraste de 2000:1 pioneiro com tecnologia IPS Black, 98% DCI-P3 e entrega de energia de 90W.'
    },
    {
      id: 9,
      sku: 'MOU-LOGI-MXM3S',
      barcode: '7891000445573',
      name: 'Mouse Sem Fio Logitech MX Master 3S Dark Field 8K DPI',
      category: 4,
      category_name: 'Periféricos & Estações',
      category_color: '#60a5fa',
      supplier: 2,
      supplier_name: 'Quantum Hardware Distribuidora',
      unit_measure: 'UN',
      cost_price: 520.00,
      selling_price: 799.00,
      quantity: 35,
      min_stock: 10,
      max_stock: 80,
      location: 'Corredor C - Prateleira 2',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 18200.00,
      total_selling_value: 27965.00,
      margin_percentage: 53.65,
      description: 'Cliques silenciosos com 90% menos ruído, rolagem MagSpeed eletromagnética e sensor Darkfield.'
    },
    {
      id: 10,
      sku: 'CBL-FIB-OM4-LC-10M',
      barcode: '7891000556677',
      name: 'Cabo Patch Cord Óptico Duplex OM4 LC-LC 10 Metros Aqua',
      category: 5,
      category_name: 'Cabos & Conectividade',
      category_color: '#93c5fd',
      supplier: 3,
      supplier_name: 'Nexus Fibra & Redes do Brasil',
      unit_measure: 'PC',
      cost_price: 48.00,
      selling_price: 89.90,
      quantity: 140,
      min_stock: 30,
      max_stock: 500,
      location: 'Caixa Cabos - Estante C1',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 6720.00,
      total_selling_value: 12586.00,
      margin_percentage: 87.29,
      description: 'Fibra óptica multimodo OM4 50/125um para aplicações de alta densidade 40G/100GbE.'
    },
    {
      id: 11,
      sku: 'TRX-SFP-10G-SR',
      barcode: '7891000556684',
      name: 'Transceiver Óptico SFP+ 10GBASE-SR 850nm 300m DDM',
      category: 5,
      category_name: 'Cabos & Conectividade',
      category_color: '#93c5fd',
      supplier: 3,
      supplier_name: 'Nexus Fibra & Redes do Brasil',
      unit_measure: 'UN',
      cost_price: 110.00,
      selling_price: 195.00,
      quantity: 42,
      min_stock: 15,
      max_stock: 150,
      location: 'Gaveta Óptica - Setor C2',
      is_active: true,
      stock_status: 'NORMAL',
      total_cost_value: 4620.00,
      total_selling_value: 8190.00,
      margin_percentage: 77.27,
      description: 'Compatibilidade universal com switches Cisco, Dell, Juniper, Arista e MikroTik.'
    }
  ];

  private mockMovements: StockMovement[] = [
    {
      id: 1,
      product: 1,
      product_name: 'Servidor PowerEdge R750 2U Rack Dual Xeon 64GB',
      product_sku: 'SRV-PWR-R750',
      product_unit: 'UN',
      movement_type: 'IN',
      movement_type_display: 'Entrada (+ Inventário)',
      quantity: 4,
      previous_stock: 0,
      new_stock: 4,
      unit_cost: 28500.00,
      total_value: 114000.00,
      reason: 'Entrada de estoque inicial via NF-e de compra',
      reference_doc: 'NF-e 44921',
      performed_by: 'Ricardo Alcantara',
      notes: 'Lote de servidores para infraestrutura core',
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: 2,
      product: 3,
      product_name: 'Switch Cisco Catalyst C9200L 48 Portas Gigabit PoE+',
      product_sku: 'SWT-CISCO-C9200L',
      product_unit: 'UN',
      movement_type: 'IN',
      movement_type_display: 'Entrada (+ Inventário)',
      quantity: 10,
      previous_stock: 0,
      new_stock: 10,
      unit_cost: 14200.00,
      total_value: 142000.00,
      reason: 'Recebimento de lote Cisco Systems',
      reference_doc: 'NF-e 55102',
      performed_by: 'Carlos Eduardo',
      notes: 'Aquisição homologada',
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      id: 3,
      product: 3,
      product_name: 'Switch Cisco Catalyst C9200L 48 Portas Gigabit PoE+',
      product_sku: 'SWT-CISCO-C9200L',
      product_unit: 'UN',
      movement_type: 'OUT',
      movement_type_display: 'Saída (- Inventário)',
      quantity: 4,
      previous_stock: 10,
      new_stock: 6,
      unit_cost: 14200.00,
      total_value: 56800.00,
      reason: 'Expedição para implantação de Datacenter Filial',
      reference_doc: 'Ordem OS-8841',
      performed_by: 'Administrador',
      notes: 'Enviado via transportadora expressa',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    },
    {
      id: 4,
      product: 5,
      product_name: 'Access Point Ubiquiti UniFi 6 Pro WiFi 6 Dual-Band',
      product_sku: 'AP-UBI-U6PRO',
      product_unit: 'UN',
      movement_type: 'OUT',
      movement_type_display: 'Saída (- Inventário)',
      quantity: 12,
      previous_stock: 12,
      new_stock: 0,
      unit_cost: 1100.00,
      total_value: 13200.00,
      reason: 'Saída total para projeto corporativo cliente premium',
      reference_doc: 'Pedido VENDA-1092',
      performed_by: 'Administrador',
      notes: 'Item esgotado temporariamente, restock solicitado',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 5,
      product: 6,
      product_name: 'SSD NVMe M.2 Samsung 990 PRO 2TB PCIe 4.0 7450MB/s',
      product_sku: 'SSD-NVME-S990PRO-2TB',
      product_unit: 'UN',
      movement_type: 'IN',
      movement_type_display: 'Entrada (+ Inventário)',
      quantity: 30,
      previous_stock: 0,
      new_stock: 30,
      unit_cost: 1150.00,
      total_value: 34500.00,
      reason: 'Compra em lote direto com fabricante Samsung',
      reference_doc: 'NF-e 88921',
      performed_by: 'Beatriz Ramos',
      notes: 'Armazenamento de alto desempenho',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 6,
      product: 6,
      product_name: 'SSD NVMe M.2 Samsung 990 PRO 2TB PCIe 4.0 7450MB/s',
      product_sku: 'SSD-NVME-S990PRO-2TB',
      product_unit: 'UN',
      movement_type: 'OUT',
      movement_type_display: 'Saída (- Inventário)',
      quantity: 2,
      previous_stock: 30,
      new_stock: 28,
      unit_cost: 1150.00,
      total_value: 2300.00,
      reason: 'Montagem de estações de trabalho de IA',
      reference_doc: 'Revisão HW-9901',
      performed_by: 'Administrador',
      notes: '',
      created_at: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ];

  private mockAlerts: StockAlert[] = [
    {
      id: 1,
      product: 5,
      product_name: 'Access Point Ubiquiti UniFi 6 Pro WiFi 6 Dual-Band',
      product_sku: 'AP-UBI-U6PRO',
      current_quantity: 0,
      min_stock: 5,
      alert_type: 'OUT_OF_STOCK',
      message: 'Ruptura Total: O item AP-UBI-U6PRO está com saldo zerado no estoque.',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 2,
      product: 2,
      product_name: 'Servidor HPE ProLiant DL380 Gen10 Plus 2U',
      product_sku: 'SRV-HPE-DL380',
      current_quantity: 1,
      min_stock: 2,
      alert_type: 'LOW_STOCK',
      message: 'Nível de Atenção: Servidor HPE DL380 possui apenas 1 unidade restante.',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 3,
      product: 7,
      product_name: 'Memória Kingston Fury Beast 32GB DDR5 6000MHz',
      product_sku: 'RAM-KST-32GB-DDR5',
      current_quantity: 3,
      min_stock: 6,
      alert_type: 'LOW_STOCK',
      message: 'Nível de Atenção: Memória DDR5 com 3 unidades (mínimo: 6).',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  constructor(private http: HttpClient) {
    // Inicializa os sinais com os dados locais
    this.categories.set(this.mockCategories);
    this.suppliers.set(this.mockSuppliers);
    this.products.set(this.mockProducts);
    this.movements.set(this.mockMovements);
    this.alerts.set(this.mockAlerts);
    this.recalculateDashboard();
    // Tenta carregar do backend Django
    this.loadFromBackend();
  }

  loadFromBackend() {
    this.loadCategories().subscribe();
    this.loadSuppliers().subscribe();
    this.loadProducts().subscribe();
    this.loadDashboard().subscribe();
    this.loadMovements().subscribe();
  }

  // --- DASHBOARD ---
  loadDashboard(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.baseUrl}/dashboard/`).pipe(
      tap(data => {
        this.dashboardData.set(data);
      }),
      catchError(() => {
        this.recalculateDashboard();
        return of(this.dashboardData()!);
      })
    );
  }

  recalculateDashboard() {
    const prods = this.products();
    const total_products = prods.length;
    let total_stock_units = 0;
    let total_inventory_cost = 0;
    let total_inventory_selling = 0;
    let out_of_stock_count = 0;
    let low_stock_count = 0;
    let healthy_stock_count = 0;

    prods.forEach(p => {
      total_stock_units += p.quantity;
      total_inventory_cost += Number(p.cost_price) * p.quantity;
      total_inventory_selling += Number(p.selling_price) * p.quantity;

      if (p.quantity <= 0) {
        out_of_stock_count++;
      } else if (p.quantity <= p.min_stock) {
        low_stock_count++;
      } else {
        healthy_stock_count++;
      }
    });

    const categories_distribution = this.categories().map(cat => {
      const items = prods.filter(p => p.category === cat.id);
      const units = items.reduce((acc, curr) => acc + curr.quantity, 0);
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        items_count: items.length,
        total_units: units
      };
    });

    const critical_products = prods
      .filter(p => p.quantity <= p.min_stock)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 6);

    const overview: DashboardOverview = {
      summary: {
        total_products,
        total_stock_units,
        total_inventory_cost,
        total_inventory_selling,
        potential_profit: total_inventory_selling - total_inventory_cost,
        out_of_stock_count,
        low_stock_count,
        healthy_stock_count,
        total_categories: this.categories().length,
        total_suppliers: this.suppliers().length,
        month_in_units: 44,
        month_out_units: 18
      },
      recent_movements: this.movements().slice(0, 8),
      critical_products,
      categories_distribution
    };

    this.dashboardData.set(overview);
  }

  // --- PRODUTOS ---
  loadProducts(filters?: any): Observable<Product[]> {
    this.isLoading.set(true);
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/products/`, { params }).pipe(
      map(res => Array.isArray(res) ? res : res.results || []),
      tap(prods => {
        this.products.set(prods);
        this.isLoading.set(false);
      }),
      catchError(() => {
        let filtered = [...this.mockProducts];
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(s) ||
            p.sku.toLowerCase().includes(s) ||
            (p.barcode && p.barcode.toLowerCase().includes(s))
          );
        }
        if (filters?.category) {
          filtered = filtered.filter(p => p.category === Number(filters.category));
        }
        if (filters?.status) {
          filtered = filtered.filter(p => p.stock_status === filters.status);
        }
        this.products.set(filtered);
        this.isLoading.set(false);
        return of(filtered);
      })
    );
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products/`, data).pipe(
      tap(newProd => {
        this.products.update(curr => [newProd, ...curr]);
        this.recalculateDashboard();
      }),
      catchError(() => {
        // Fallback local
        const categoryObj = this.categories().find(c => c.id === Number(data.category));
        const supplierObj = this.suppliers().find(s => s.id === Number(data.supplier));
        const qty = Number(data.quantity) || 0;
        const cost = Number(data.cost_price) || 0;
        const selling = Number(data.selling_price) || 0;
        const minStock = Number(data.min_stock) || 5;

        const newProd: Product = {
          id: Date.now(),
          sku: data.sku?.toUpperCase() || `SKU-${Math.floor(Math.random() * 10000)}`,
          barcode: data.barcode || '',
          name: data.name || 'Novo Produto',
          description: data.description || '',
          category: data.category ? Number(data.category) : null,
          category_name: categoryObj?.name || 'Geral',
          category_color: categoryObj?.color || '#3b82f6',
          supplier: data.supplier ? Number(data.supplier) : null,
          supplier_name: supplierObj?.name || 'Direto',
          unit_measure: data.unit_measure || 'UN',
          cost_price: cost,
          selling_price: selling,
          quantity: qty,
          min_stock: minStock,
          max_stock: Number(data.max_stock) || 100,
          location: data.location || 'Depósito Central',
          is_active: true,
          stock_status: qty <= 0 ? 'OUT_OF_STOCK' : (qty <= minStock ? 'LOW_STOCK' : 'NORMAL'),
          total_cost_value: qty * cost,
          total_selling_value: qty * selling,
          margin_percentage: cost > 0 ? ((selling - cost) / cost) * 100 : 0,
          created_at: new Date().toISOString()
        };

        this.mockProducts.unshift(newProd);
        this.products.update(curr => [newProd, ...curr]);
        this.recalculateDashboard();
        return of(newProd);
      })
    );
  }

  updateProduct(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}/`, data).pipe(
      tap(updated => {
        this.products.update(curr => curr.map(p => p.id === id ? updated : p));
        this.recalculateDashboard();
      }),
      catchError(() => {
        const categoryObj = this.categories().find(c => c.id === Number(data.category));
        const supplierObj = this.suppliers().find(s => s.id === Number(data.supplier));

        this.products.update(curr => curr.map(p => {
          if (p.id === id) {
            const qty = data.quantity !== undefined ? Number(data.quantity) : p.quantity;
            const cost = data.cost_price !== undefined ? Number(data.cost_price) : Number(p.cost_price);
            const selling = data.selling_price !== undefined ? Number(data.selling_price) : Number(p.selling_price);
            const minStock = data.min_stock !== undefined ? Number(data.min_stock) : p.min_stock;

            const updatedProd: Product = {
              ...p,
              ...data,
              category_name: categoryObj ? categoryObj.name : p.category_name,
              category_color: categoryObj ? categoryObj.color : p.category_color,
              supplier_name: supplierObj ? supplierObj.name : p.supplier_name,
              stock_status: qty <= 0 ? 'OUT_OF_STOCK' : (qty <= minStock ? 'LOW_STOCK' : 'NORMAL'),
              total_cost_value: qty * cost,
              total_selling_value: qty * selling,
              margin_percentage: cost > 0 ? ((selling - cost) / cost) * 100 : 0
            };
            return updatedProd;
          }
          return p;
        }));
        this.recalculateDashboard();
        const found = this.products().find(p => p.id === id)!;
        return of(found);
      })
    );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}/`).pipe(
      tap(() => {
        this.products.update(curr => curr.filter(p => p.id !== id));
        this.recalculateDashboard();
      }),
      catchError(() => {
        this.products.update(curr => curr.filter(p => p.id !== id));
        this.recalculateDashboard();
        return of({ success: true });
      })
    );
  }

  // --- ARQUIVAMENTO DE PRODUTOS ---
  archiveProduct(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/${id}/archive/`, { reason }).pipe(
      tap(res => {
        if (res.product) {
          this.products.update(curr => curr.map(p => p.id === id ? res.product : p));
        } else {
          this.products.update(curr => curr.map(p => p.id === id ? { ...p, is_archived: true, archive_reason: reason } : p));
        }
        this.recalculateDashboard();
      }),
      catchError(() => {
        this.products.update(curr => curr.map(p => p.id === id ? { ...p, is_archived: true, archive_reason: reason } : p));
        this.recalculateDashboard();
        return of({ success: true });
      })
    );
  }

  unarchiveProduct(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/${id}/unarchive/`, {}).pipe(
      tap(res => {
        if (res.product) {
          this.products.update(curr => curr.map(p => p.id === id ? res.product : p));
        } else {
          this.products.update(curr => curr.map(p => p.id === id ? { ...p, is_archived: false, archive_reason: undefined } : p));
        }
        this.recalculateDashboard();
      }),
      catchError(() => {
        this.products.update(curr => curr.map(p => p.id === id ? { ...p, is_archived: false, archive_reason: undefined } : p));
        this.recalculateDashboard();
        return of({ success: true });
      })
    );
  }

  // --- ENTREGAS & DESPACHO LOGÍSTICO ---
  loadDeliveries(): Observable<DeliveryOrder[]> {
    return this.http.get<any>(`${this.baseUrl}/deliveries/`).pipe(
      map(res => Array.isArray(res) ? res : res.results || []),
      tap(orders => {
        this.deliveries.set(orders);
      }),
      catchError(() => {
        return of(this.deliveries());
      })
    );
  }

  dispatchDelivery(productId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/${productId}/dispatch-delivery/`, payload).pipe(
      tap(res => {
        if (res.delivery) {
          this.deliveries.update(curr => [res.delivery, ...curr]);
        }
        if (res.product) {
          this.products.update(curr => curr.map(p => p.id === productId ? res.product : p));
        }
        this.recalculateDashboard();
      }),
      catchError(() => {
        // Fallback local
        const prod = this.products().find(p => p.id === productId);
        if (!prod) return throwError(() => new Error('Produto não encontrado'));
        const qty = Number(payload.quantity) || 1;
        if (prod.quantity < qty) return throwError(() => new Error('Estoque insuficiente para despacho'));

        const code = `BR${Date.now().toString().slice(-8)}BR`;
        const newDelivery: DeliveryOrder = {
          id: Date.now(),
          product: prod.id,
          product_name: prod.name,
          product_sku: prod.sku,
          quantity: qty,
          recipient_name: payload.recipient_name,
          recipient_address: payload.recipient_address,
          recipient_phone: payload.recipient_phone || '',
          carrier: payload.carrier || 'CORREIOS',
          tracking_code: code,
          external_delivery_url: `https://rastreamento.correios.com.br/app/index.php?codigo=${code}`,
          status: 'DISPATCHED',
          shipping_cost: payload.shipping_cost || 0,
          created_at: new Date().toISOString()
        };

        this.deliveries.update(curr => [newDelivery, ...curr]);
        this.products.update(curr => curr.map(p => p.id === productId ? { ...p, quantity: p.quantity - qty } : p));
        this.recalculateDashboard();
        return of({ delivery: newDelivery, product: prod });
      })
    );
  }

  updateDeliveryStatus(id: number, status: DeliveryStatus): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/deliveries/${id}/update_status/`, { status }).pipe(
      tap(res => {
        const updated = res.delivery || res;
        this.deliveries.update(curr => curr.map(d => d.id === id ? { ...d, status, status_display: updated.status_display } : d));
      }),
      catchError(() => {
        this.deliveries.update(curr => curr.map(d => d.id === id ? { ...d, status } : d));
        return of({ success: true });
      })
    );
  }

  // --- MOVIMENTAÇÃO RÁPIDA ---
  quickMovement(productId: number, payload: { movement_type: 'IN' | 'OUT'; quantity: number; reason: string; reference_doc?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products/${productId}/quick-movement/`, payload).pipe(
      tap(res => {
        if (res.product) {
          this.products.update(curr => curr.map(p => p.id === productId ? res.product : p));
        }
        if (res.movement) {
          this.movements.update(curr => [res.movement, ...curr]);
        }
        this.recalculateDashboard();
      }),
      catchError(() => {
        // Simulação local
        const prod = this.products().find(p => p.id === productId);
        if (!prod) return throwError(() => new Error('Produto não encontrado'));

        if (payload.movement_type === 'OUT' && prod.quantity < payload.quantity) {
          return throwError(() => new Error(`Estoque insuficiente! Saldo atual é de ${prod.quantity} unidades.`));
        }

        const prev = prod.quantity;
        const next = payload.movement_type === 'IN' ? prev + payload.quantity : prev - payload.quantity;
        const unitCost = Number(prod.cost_price);

        const newMovement: StockMovement = {
          id: Date.now(),
          product: prod.id,
          product_name: prod.name,
          product_sku: prod.sku,
          product_unit: prod.unit_measure,
          movement_type: payload.movement_type,
          movement_type_display: payload.movement_type === 'IN' ? 'Entrada (+ Inventário)' : 'Saída (- Inventário)',
          quantity: payload.quantity,
          previous_stock: prev,
          new_stock: next,
          unit_cost: unitCost,
          total_value: unitCost * payload.quantity,
          reason: payload.reason,
          reference_doc: payload.reference_doc || 'PAINEL_RAPIDO',
          performed_by: 'Administrador',
          created_at: new Date().toISOString()
        };

        this.updateProduct(productId, { quantity: next }).subscribe();
        this.movements.update(curr => [newMovement, ...curr]);
        this.recalculateDashboard();

        return of({
          message: 'Movimentação rápida registrada!',
          product: { ...prod, quantity: next },
          movement: newMovement
        });
      })
    );
  }

  // --- MOVIMENTAÇÕES COMPLETAS ---
  loadMovements(filters?: any): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.set(key, filters[key]);
      });
    }

    return this.http.get<any>(`${this.baseUrl}/movements/`, { params }).pipe(
      map(res => Array.isArray(res) ? res : res.results || []),
      tap(list => this.movements.set(list)),
      catchError(() => of(this.movements()))
    );
  }

  createMovement(data: any): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.baseUrl}/movements/`, data).pipe(
      tap(newM => {
        this.movements.update(curr => [newM, ...curr]);
        this.loadProducts().subscribe();
        this.loadDashboard().subscribe();
      }),
      catchError(() => {
        const prod = this.products().find(p => p.id === Number(data.product));
        if (!prod) return throwError(() => new Error('Produto inexistente'));

        const prev = prod.quantity;
        let next = prev;
        const qty = Number(data.quantity);

        if (data.movement_type === 'IN') next = prev + qty;
        else if (data.movement_type === 'OUT') next = prev - qty;
        else if (data.movement_type === 'ADJUST') next = qty;

        const newM: StockMovement = {
          id: Date.now(),
          product: prod.id,
          product_name: prod.name,
          product_sku: prod.sku,
          product_unit: prod.unit_measure,
          movement_type: data.movement_type,
          movement_type_display: data.movement_type === 'IN' ? 'Entrada (+ Inventário)' : 'Saída (- Inventário)',
          quantity: qty,
          previous_stock: prev,
          new_stock: next,
          unit_cost: Number(prod.cost_price),
          total_value: Number(prod.cost_price) * qty,
          reason: data.reason || 'Movimentação manual',
          reference_doc: data.reference_doc || '',
          performed_by: 'Administrador',
          notes: data.notes || '',
          created_at: new Date().toISOString()
        };

        this.updateProduct(prod.id, { quantity: next }).subscribe();
        this.movements.update(curr => [newM, ...curr]);
        this.recalculateDashboard();
        return of(newM);
      })
    );
  }

  // --- CATEGORIAS & FORNECEDORES ---
  loadCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.baseUrl}/categories/`).pipe(
      map(res => Array.isArray(res) ? res : res.results || []),
      tap(cats => this.categories.set(cats)),
      catchError(() => of(this.categories()))
    );
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories/`, data).pipe(
      tap(newC => this.categories.update(curr => [...curr, newC])),
      catchError(() => {
        const newC: Category = {
          id: Date.now(),
          name: data.name || 'Nova Categoria',
          slug: (data.name || 'cat').toLowerCase().replace(/\s+/g, '-'),
          description: data.description || '',
          color: data.color || '#3b82f6',
          icon: data.icon || 'layers',
          products_count: 0
        };
        this.categories.update(curr => [...curr, newC]);
        return of(newC);
      })
    );
  }

  loadSuppliers(): Observable<Supplier[]> {
    return this.http.get<any>(`${this.baseUrl}/suppliers/`).pipe(
      map(res => Array.isArray(res) ? res : res.results || []),
      tap(sups => this.suppliers.set(sups)),
      catchError(() => of(this.suppliers()))
    );
  }

  createSupplier(data: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/suppliers/`, data).pipe(
      tap(newS => this.suppliers.update(curr => [...curr, newS])),
      catchError(() => {
        const newS: Supplier = {
          id: Date.now(),
          name: data.name || 'Novo Fornecedor',
          cnpj_cpf: data.cnpj_cpf || '',
          contact_person: data.contact_person || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          products_count: 0
        };
        this.suppliers.update(curr => [...curr, newS]);
        return of(newS);
      })
    );
  }

  // --- ALERTAS ---
  loadAlerts(): Observable<StockAlert[]> {
    return this.http.get<any>(`${this.baseUrl}/alerts/`).pipe(
      map(res => Array.isArray(res) ? res : res.results || []),
      tap(alerts => this.alerts.set(alerts)),
      catchError(() => of(this.alerts()))
    );
  }

  markAlertRead(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/alerts/${id}/mark_read/`, {}).pipe(
      tap(() => {
        this.alerts.update(curr => curr.filter(a => a.id !== id));
      }),
      catchError(() => {
        this.alerts.update(curr => curr.filter(a => a.id !== id));
        return of({ success: true });
      })
    );
  }
}
