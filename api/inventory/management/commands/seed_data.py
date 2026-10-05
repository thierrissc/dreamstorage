from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from inventory.models import Category, Supplier, Product, StockMovement, StockAlert


class Command(BaseCommand):
    help = "Popula o banco de dados com dados de teste realistas para o DreamStorage"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Iniciando população de dados do DreamStorage..."))

        # 1. Cria usuário administrador padrão
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@dreamstorage.io",
                "first_name": "Administrador",
                "last_name": "DreamStorage",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password("admin123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("[OK] Usuario admin criado (user: admin, senha: admin123)"))
        else:
            self.stdout.write("[OK] Usuario admin ja existe.")

        # 2. Cria Categorias
        categories_data = [
            {"name": "Servidores & Datacenter", "color": "#1d4ed8", "icon": "server", "description": "Servidores rack, lâminas, blades e fontes redundantes"},
            {"name": "Redes & Infraestrutura", "color": "#2563eb", "icon": "wifi", "description": "Switches gerenciáveis, roteadores enterprise, access points"},
            {"name": "Componentes & Memórias", "color": "#3b82f6", "icon": "cpu", "description": "Processadores Xeon/EPYC, memórias ECC DDR5 e SSDs NVMe Enterprise"},
            {"name": "Periféricos & Estações", "color": "#60a5fa", "icon": "monitor", "description": "Monitores calibrados, teclados mecânicos ergonômicos e docks"},
            {"name": "Cabos & Conectividade", "color": "#93c5fd", "icon": "link", "description": "Cabos ópticos OM4/OS2, patch cords Cat6A e transceivers SFP+"},
        ]

        cats = {}
        for c in categories_data:
            cat, _ = Category.objects.update_or_create(
                name=c["name"],
                defaults={"color": c["color"], "icon": c["icon"], "description": c["description"]}
            )
            cats[c["name"]] = cat
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(cats)} categorias configuradas"))

        # 3. Cria Fornecedores
        suppliers_data = [
            {
                "name": "Synapse Tech Soluções Globais",
                "cnpj_cpf": "12.345.678/0001-90",
                "contact_person": "Ricardo Alcantara",
                "email": "contato@synapsetech.com.br",
                "phone": "(11) 3456-7890",
                "address": "Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP",
            },
            {
                "name": "Quantum Hardware Distribuidora",
                "cnpj_cpf": "98.765.432/0001-11",
                "contact_person": "Mariana Esteves",
                "email": "vendas@quantumhardware.com.br",
                "phone": "(19) 3211-9988",
                "address": "Rodovia Dom Pedro I, km 135 - Campinas, SP",
            },
            {
                "name": "Nexus Fibra & Redes do Brasil",
                "cnpj_cpf": "45.123.789/0001-55",
                "contact_person": "Carlos Eduardo Duarte",
                "email": "pedidos@nexusfibra.com",
                "phone": "(21) 2555-1234",
                "address": "Rua Primeiro de Março, 80 - Rio de Janeiro, RJ",
            },
            {
                "name": "Apex Microchips & Armazenamento",
                "cnpj_cpf": "77.888.999/0001-33",
                "contact_person": "Beatriz Ramos",
                "email": "comercial@apexstorage.com",
                "phone": "(41) 3044-8800",
                "address": "Rua Marechal Deodoro, 500 - Curitiba, PR",
            },
        ]

        supps = {}
        for s in suppliers_data:
            sup, _ = Supplier.objects.update_or_create(
                name=s["name"],
                defaults={
                    "cnpj_cpf": s["cnpj_cpf"],
                    "contact_person": s["contact_person"],
                    "email": s["email"],
                    "phone": s["phone"],
                    "address": s["address"]
                }
            )
            supps[s["name"]] = sup
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(supps)} fornecedores configurados"))

        # 4. Produtos Realistas com Variedade de Estoque
        products_data = [
            {
                "sku": "SRV-PWR-R750",
                "barcode": "7891000112231",
                "name": "Servidor PowerEdge R750 2U Rack Dual Xeon 64GB",
                "category": cats["Servidores & Datacenter"],
                "supplier": supps["Synapse Tech Soluções Globais"],
                "unit_measure": "UN",
                "cost_price": Decimal("28500.00"),
                "selling_price": Decimal("39900.00"),
                "quantity": 4,
                "min_stock": 2,
                "max_stock": 10,
                "location": "Rack Alpha - Setor S1",
                "description": "Servidor de missão crítica com 2x Xeon Silver 4314, 64GB RAM DDR4 ECC, controladora PERC H745.",
            },
            {
                "sku": "SRV-HPE-DL380",
                "barcode": "7891000112248",
                "name": "Servidor HPE ProLiant DL380 Gen10 Plus 2U",
                "category": cats["Servidores & Datacenter"],
                "supplier": supps["Synapse Tech Soluções Globais"],
                "unit_measure": "UN",
                "cost_price": Decimal("32000.00"),
                "selling_price": Decimal("44500.00"),
                "quantity": 1,
                "min_stock": 2,  # BAIXO ESTOQUE PARA TESTE DE ALERTA
                "max_stock": 8,
                "location": "Rack Alpha - Setor S2",
                "description": "Excelente para virtualização intensa, compatível com VMware vSphere e Proxmox VE.",
            },
            {
                "sku": "SWT-CISCO-C9200L",
                "barcode": "7891000223344",
                "name": "Switch Cisco Catalyst C9200L 48 Portas Gigabit PoE+",
                "category": cats["Redes & Infraestrutura"],
                "supplier": supps["Nexus Fibra & Redes do Brasil"],
                "unit_measure": "UN",
                "cost_price": Decimal("14200.00"),
                "selling_price": Decimal("19800.00"),
                "quantity": 6,
                "min_stock": 3,
                "max_stock": 20,
                "location": "Corredor B - Prateleira 4",
                "description": "Switch de camada 3 avançada com 4 uplinks 10G SFP+ e PoE full budget 740W.",
            },
            {
                "sku": "RT-MIK-CCR2004",
                "barcode": "7891000223351",
                "name": "Roteador MikroTik CCR2004-1G-12S+2XS Cloud Core",
                "category": cats["Redes & Infraestrutura"],
                "supplier": supps["Nexus Fibra & Redes do Brasil"],
                "unit_measure": "UN",
                "cost_price": Decimal("4800.00"),
                "selling_price": Decimal("6750.00"),
                "quantity": 8,
                "min_stock": 4,
                "max_stock": 25,
                "location": "Corredor B - Prateleira 2",
                "description": "Processador Annapurna Labs Alpine v2 com 4 núcleos 64-bit 1.7GHz e 12 portas 10G SFP+.",
            },
            {
                "sku": "AP-UBI-U6PRO",
                "barcode": "7891000223368",
                "name": "Access Point Ubiquiti UniFi 6 Pro WiFi 6 Dual-Band",
                "category": cats["Redes & Infraestrutura"],
                "supplier": supps["Nexus Fibra & Redes do Brasil"],
                "unit_measure": "UN",
                "cost_price": Decimal("1100.00"),
                "selling_price": Decimal("1650.00"),
                "quantity": 0,  # ESGOTADO PARA TESTE DE ALERTA DE RUPTURA
                "min_stock": 5,
                "max_stock": 40,
                "location": "Corredor B - Prateleira 1",
                "description": "Taxa de transferência agregada de até 5.3 Gbps em bandas 5 GHz e 2.4 GHz com MIMO 4x4.",
            },
            {
                "sku": "SSD-NVME-S990PRO-2TB",
                "barcode": "7891000334455",
                "name": "SSD NVMe M.2 Samsung 990 PRO 2TB PCIe 4.0 7450MB/s",
                "category": cats["Componentes & Memórias"],
                "supplier": supps["Apex Microchips & Armazenamento"],
                "unit_measure": "UN",
                "cost_price": Decimal("1150.00"),
                "selling_price": Decimal("1690.00"),
                "quantity": 28,
                "min_stock": 10,
                "max_stock": 100,
                "location": "Cofre Componentes - Gaveta 3",
                "description": "Velocidade de leitura sequencial de até 7.450 MB/s e gravação até 6.900 MB/s com DRAM LPDDR4.",
            },
            {
                "sku": "RAM-KST-32GB-DDR5",
                "barcode": "7891000334462",
                "name": "Memória Kingston Fury Beast 32GB (2x16GB) DDR5 6000MHz",
                "category": cats["Componentes & Memórias"],
                "supplier": supps["Apex Microchips & Armazenamento"],
                "unit_measure": "KIT",
                "cost_price": Decimal("720.00"),
                "selling_price": Decimal("1099.00"),
                "quantity": 3,  # BAIXO ESTOQUE
                "min_stock": 6,
                "max_stock": 50,
                "location": "Cofre Componentes - Gaveta 1",
                "description": "Módulos de alta velocidade com perfis Intel XMP 3.0 e dissipador térmico em alumínio preto fosco.",
            },
            {
                "sku": "MON-DELL-U2723QE",
                "barcode": "7891000445566",
                "name": "Monitor UltraSharp Dell 27\" 4K IPS Black USB-C Hub",
                "category": cats["Periféricos & Estações"],
                "supplier": supps["Quantum Hardware Distribuidora"],
                "unit_measure": "UN",
                "cost_price": Decimal("3800.00"),
                "selling_price": Decimal("5290.00"),
                "quantity": 12,
                "min_stock": 3,
                "max_stock": 25,
                "location": "Corredor D - Palete 2",
                "description": "Contraste de 2000:1 pioneiro com tecnologia IPS Black, 98% DCI-P3 e entrega de energia de 90W.",
            },
            {
                "sku": "MOU-LOGI-MXM3S",
                "barcode": "7891000445573",
                "name": "Mouse Sem Fio Logitech MX Master 3S Dark Field 8K DPI",
                "category": cats["Periféricos & Estações"],
                "supplier": supps["Quantum Hardware Distribuidora"],
                "unit_measure": "UN",
                "cost_price": Decimal("520.00"),
                "selling_price": Decimal("799.00"),
                "quantity": 35,
                "min_stock": 10,
                "max_stock": 80,
                "location": "Corredor C - Prateleira 2",
                "description": "Cliques silenciosos com 90% menos ruído, rolagem MagSpeed eletromagnética e sensor Darkfield.",
            },
            {
                "sku": "CBL-FIB-OM4-LC-10M",
                "barcode": "7891000556677",
                "name": "Cabo Patch Cord Óptico Duplex OM4 LC-LC 10 Metros Aqua",
                "category": cats["Cabos & Conectividade"],
                "supplier": supps["Nexus Fibra & Redes do Brasil"],
                "unit_measure": "PC",
                "cost_price": Decimal("48.00"),
                "selling_price": Decimal("89.90"),
                "quantity": 140,
                "min_stock": 30,
                "max_stock": 500,
                "location": "Caixa Cabos - Estante C1",
                "description": "Fibra óptica multimodo OM4 50/125um para aplicações de alta densidade 40G/100GbE.",
            },
            {
                "sku": "TRX-SFP-10G-SR",
                "barcode": "7891000556684",
                "name": "Transceiver Óptico SFP+ 10GBASE-SR 850nm 300m DDM",
                "category": cats["Cabos & Conectividade"],
                "supplier": supps["Nexus Fibra & Redes do Brasil"],
                "unit_measure": "UN",
                "cost_price": Decimal("110.00"),
                "selling_price": Decimal("195.00"),
                "quantity": 42,
                "min_stock": 15,
                "max_stock": 150,
                "location": "Gaveta Óptica - Setor C2",
                "description": "Compatibilidade universal com switches Cisco, Dell, Juniper, Arista e MikroTik.",
            },
        ]

        created_products = []
        for pdata in products_data:
            prod, _ = Product.objects.update_or_create(
                sku=pdata["sku"],
                defaults=pdata
            )
            created_products.append(prod)
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(created_products)} produtos configurados"))

        # 5. Criar Movimentações Históricas de Auditoria
        movements_sample = [
            {
                "product": created_products[0],
                "movement_type": StockMovement.TYPE_IN,
                "quantity": 4,
                "previous_stock": 0,
                "new_stock": 4,
                "unit_cost": Decimal("28500.00"),
                "total_value": Decimal("114000.00"),
                "reason": "Entrada de estoque inicial via NF-e de compra",
                "reference_doc": "NF-e 44921",
                "performed_by": "Ricardo Alcantara",
            },
            {
                "product": created_products[2],
                "movement_type": StockMovement.TYPE_IN,
                "quantity": 10,
                "previous_stock": 0,
                "new_stock": 10,
                "unit_cost": Decimal("14200.00"),
                "total_value": Decimal("142000.00"),
                "reason": "Recebimento de lote Cisco Systems",
                "reference_doc": "NF-e 55102",
                "performed_by": "Carlos Eduardo",
            },
            {
                "product": created_products[2],
                "movement_type": StockMovement.TYPE_OUT,
                "quantity": 4,
                "previous_stock": 10,
                "new_stock": 6,
                "unit_cost": Decimal("14200.00"),
                "total_value": Decimal("56800.00"),
                "reason": "Expedição para implantação de Datacenter Filial",
                "reference_doc": "Ordem OS-8841",
                "performed_by": "Administrador",
            },
            {
                "product": created_products[4],
                "movement_type": StockMovement.TYPE_OUT,
                "quantity": 12,
                "previous_stock": 12,
                "new_stock": 0,
                "unit_cost": Decimal("1100.00"),
                "total_value": Decimal("13200.00"),
                "reason": "Saída total para projeto corporativo cliente premium",
                "reference_doc": "Pedido VENDA-1092",
                "performed_by": "Administrador",
            },
            {
                "product": created_products[5],
                "movement_type": StockMovement.TYPE_IN,
                "quantity": 30,
                "previous_stock": 0,
                "new_stock": 30,
                "unit_cost": Decimal("1150.00"),
                "total_value": Decimal("34500.00"),
                "reason": "Compra em lote direto com fabricante Samsung",
                "reference_doc": "NF-e 88921",
                "performed_by": "Beatriz Ramos",
            },
            {
                "product": created_products[5],
                "movement_type": StockMovement.TYPE_OUT,
                "quantity": 2,
                "previous_stock": 30,
                "new_stock": 28,
                "unit_cost": Decimal("1150.00"),
                "total_value": Decimal("2300.00"),
                "reason": "Montagem de estações de trabalho de IA",
                "reference_doc": "Revisão HW-9901",
                "performed_by": "Administrador",
            },
        ]

        StockMovement.objects.all().delete()
        for m in movements_sample:
            StockMovement.objects.create(**m)
        self.stdout.write(self.style.SUCCESS(f"[OK] {len(movements_sample)} registros de movimentacao criados"))

        # 6. Alertas de Estoque Automáticos
        StockAlert.objects.all().delete()
        for p in created_products:
            if p.quantity <= 0:
                StockAlert.objects.create(
                    product=p,
                    alert_type=StockAlert.ALERT_OUT,
                    message=f"Ruptura Total: O item {p.name} (SKU: {p.sku}) esta zerado no estoque."
                )
            elif p.quantity <= p.min_stock:
                StockAlert.objects.create(
                    product=p,
                    alert_type=StockAlert.ALERT_LOW,
                    message=f"Nivel de Atencao: {p.name} atingiu {p.quantity} unidades (minimo: {p.min_stock})."
                )
        self.stdout.write(self.style.SUCCESS("[OK] Alertas de ruptura e estoque baixo sincronizados com sucesso"))
        self.stdout.write(self.style.SUCCESS("[SUCESSO] Banco do DreamStorage populado com sucesso!"))
