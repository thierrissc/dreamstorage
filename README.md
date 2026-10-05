# DreamStorage - Sistema Inteligente de Controle de Estoque
> **Royal Blue & Cream Liquid Glass Aesthetic**
> Sistema empresarial de controle de estoque de alta performance, construído com **Angular** no frontend e **Django REST Framework** no backend.

---

## 💎 Visão Geral do Sistema
O **DreamStorage** é uma solução completa para gestão moderna de inventário, projetada para combinar eficiência operacional e uma experiência visual de ponta com efeito *Liquid Glass* (vidro líquido com reflexos especulares e desfoque dinâmico), paleta de cores nobre em **Royal Blue** e **Creme**, responsividade total e arquitetura escalável e segura.

### 🌟 Destaques do Projeto
- **Interface Liquid Glass**: Efeitos de refração, vidro fumê azul royal translúcido, detalhes em creme marfim, blur dinâmico (`backdrop-filter`) e micro-interações fluidas.
- **Painel de Controle em Tempo Real**: KPIs de valor total do estoque, itens críticos, giro de estoque, movimentações recentes e alertas automáticos de reposição.
- **Gestão Abrangente de Produtos**: Cadastro detalhado com SKU, código de barras, categorias, fornecedores, preço de custo, preço de venda, estoque mínimo, alertas de ruptura e localização física no armazém.
- **Movimentações de Estoque (Auditoria Completa)**: Registro auditável de entradas (compras), saídas (vendas/descartes) e ajustes manuais com justificativa e histórico imutável.
- **Segurança e Permissões**: Autenticação robusta (JWT / Token), proteção contra CSRF, controle de acesso e sanitização de dados.
- **API RESTful Completa com Django**: Documentação clara de endpoints, serializers validados e suporte a banco relacional (SQLite para dev/PostgreSQL para prod).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 21+** (Standalone Components, Signals, Reactive Forms, Router)
- **TypeScript & JavaScript moderno**
- **HTML5 Semântico & Vanilla CSS Avançado** (Liquid Glassmorphism, CSS Custom Properties, Animações Fluidas)
- **Lucide / Feather Icons** estilizados para estética tecnológica

### Backend
- **Python 3.12+**
- **Django 5+ & Django REST Framework (DRF)**
- **Django CORS Headers** para comunicação segura com o frontend
- **SQLite / PostgreSQL** com migrações automáticas e seeds de demonstração

---

## 📁 Estrutura do Repositório
```
dreamstorage/
├── backend/                  # API Django REST Framework
│   ├── manage.py
│   ├── dreamstorage_core/    # Configurações do projeto Django
│   ├── inventory/            # Módulo principal de estoque, produtos e movimentações
│   ├── authentication/       # Módulo de autenticação e usuários
│   └── requirements.txt
├── frontend/                 # Aplicação Angular (Liquid Glass UI)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Serviços de API, auth, interceptors
│   │   │   ├── shared/       # Componentes compartilhados, modais, pipes
│   │   │   ├── features/     # Dashboard, Produtos, Movimentações, Categorias
│   │   └── styles.css        # Design System (Royal Blue & Cream Liquid Glass)
└── README.md
```

---

## 🚀 Como Executar Localmente

### Backend (Django)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data    # Popula dados de demonstração
python manage.py runserver
```

### Frontend (Angular)
```bash
cd frontend
npm install
npm start
```
Acesse a aplicação em: `http://localhost:4200`
