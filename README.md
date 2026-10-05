# DreamStorage - Sistema Inteligente de Controle de Estoque
> Royal Blue & Cream Liquid Glass Aesthetic
> Arquitetura empresarial unificada com Angular 21 e Django REST Framework.

---

## Visao Geral do Sistema
O **DreamStorage** e uma solucao integrada para gestao moderna de inventario e controle logistico de estoque, projetada segundo as melhores praticas de engenharia de software e design de interfaces. O sistema une a robustez do backend em Python com o dinamismo do Angular e a elegancia visual da estetica **Liquid Glass** (vidro translucido com reflexos especulares e desfoque adaptativo), paleta nobre em **Royal Blue** e **Creme**, responsividade total e zero emojis, priorizando iconografia SVG precisa.

### Principais Pilares da Engenharia
- **Primitivos UI Inspirados em shadcn/ui e 21st.dev**: Arquitetura modular de componentes em `src/app/components/ui/` (Button, Badge, Card, Dialog, Input, Table), oferecendo consistencia de design, alta acessibilidade (ARIA) e controle de estado reativo com Signals.
- **Liquid Glass Design System**: Tokens dedicados para cores Royal Blue (`#060d21`, `#102154`, `#3062ea`), Creme Marfim (`#fbf7ee`, `#ebdcc0`, `#decda9`), efeitos de vidro liquido com `backdrop-filter: blur(20px)`, iluminacao dinamica e micro-interacoes fluidas.
- **Auditoria Imutavel de Estoque**: Todas as entradas (compras), saidas (expedicao/venda) e ajustes de balanco fisico sao registrados atomicamente via transacoes ACID no banco de dados (`select_for_update`), preservando historico de auditoria, precos, documentos e operadores.
- **Deteccao Proativa de Ruptura**: Sistema de alerta automatico para produtos com saldo zerado ou abaixo da margem de seguranca configurada.
- **Arquitetura Unificada**: Eliminacao de subdivisoes genericas de pastas (`frontend`/`backend`), organizando o projeto de forma coesa com `src/` para interface, `api/` para motor de regras de negocio e pontos de entrada consolidados na raiz (`manage.py`, `package.json`, `requirements.txt`).

---

## Estrutura do Repositorio
```
dreamstorage/
├── api/                           # Motor de regras de negocio (Django REST Framework)
│   ├── authentication/            # Modulo de usuarios, autenticacao e perfis
│   ├── dreamstorage_core/         # Configuracoes do projeto (settings, urls, wsgi)
│   ├── inventory/                 # Modulo de produtos, categorias, fornecedores e auditoria
│   │   ├── management/commands/   # Comando de carga seed_data
│   │   ├── migrations/            # Versionamento de schema de banco
│   │   ├── models.py              # Modelos relacionais (Product, Category, Movement, Alert)
│   │   ├── serializers.py         # Validacao e serializacao transacional
│   │   └── views.py               # ViewSets e consolidacao de dashboard
│   ├── manage.py                  # CLI Django interno
│   └── requirements.txt           # Dependencias Python
├── src/                           # Aplicacao Angular 21 (Client Architecture)
│   ├── app/
│   │   ├── components/
│   │   │   └── ui/                # Primitivos UI (Button, Badge, Card, etc.)
│   │   ├── core/                  # Servicos singleton (InventoryService, AuthService, ToastService)
│   │   ├── features/              # Modulos de dominio
│   │   │   ├── categories/        # Gestao taxonomica e fornecedores
│   │   │   ├── dashboard/         # Metricas analiticas e KPIs em tempo real
│   │   │   ├── movements/         # Livro-razao e auditoria de movimentacoes
│   │   │   └── products/          # Catalogo de itens, gauges e acoes rapidas
│   │   ├── models/                # Interfaces e tipos de dominio TypeScript
│   │   └── shared/                # Navbar, Sidebar, ToastContainer
│   ├── styles.css                 # Design System Tokens (Liquid Glass, Royal Blue, Cream)
│   ├── index.html                 # HTML semantico com fontes Plus Jakarta Sans e Outfit
│   └── main.ts                    # Bootstrap Angular
├── public/                        # Assets estaticos publicos
├── angular.json                   # Configuracoes de build do Angular
├── package.json                   # Dependencias e scripts de execucao
├── requirements.txt               # Dependencias Python na raiz
├── manage.py                      # Ponto de entrada CLI unificado para Django
└── README.md
```

---

## Guia de Execucao

### 1. Requisitos
- Node.js 18+ (recomendado Node 20+)
- Python 3.10+ (recomendado Python 3.12+)

### 2. Backend (API Django REST Framework)
A partir da raiz do projeto:
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data        # Popula o banco com itens realistas de datacenter e rede
python manage.py runserver 8000
```
A API estara disponivel em: `http://localhost:8000/api/`

### 3. Frontend (Interface Angular Liquid Glass)
A partir da raiz do projeto:
```bash
npm install
npm start
```
A interface do usuario estara acessivel em: `http://localhost:4200`

---

## Endpoints da API REST
| Metodo | Endpoint | Descricao |
| :--- | :--- | :--- |
| GET | `/api/` | Verificacao de integridade e mapa de rotas |
| GET | `/api/inventory/dashboard/` | Metricas consolidadas em tempo real |
| GET, POST | `/api/inventory/products/` | Catalogo e cadastro de produtos |
| POST | `/api/inventory/products/{id}/quick-movement/` | Entrada ou saida rapida direta da linha |
| GET, POST | `/api/inventory/movements/` | Livro de movimentacoes de estoque |
| GET, POST | `/api/inventory/categories/` | Gestao de categorias |
| GET, POST | `/api/inventory/suppliers/` | Gestao de fornecedores |
| GET, POST | `/api/inventory/alerts/` | Consulta e marcacao de alertas de ruptura |
| POST | `/api/auth/login/` | Autenticacao de sessao |
