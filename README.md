# DreamStorage - Sistema Inteligente de Controle de Estoque

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Angular](https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Django](https://img.shields.io/badge/Django_5-092E20?style=for-the-badge&logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/DRF-A30000?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## Visao Geral

O **DreamStorage** e uma solucao empresarial para gestao de inventario e controle logistico de estoque, projetada segundo padroes modernos de engenharia de software e design limpo (clean aesthetic). 

A aplicacao utiliza **JavaScript como linguagem de maior uso no frontend** (desenvolvida com o framework Angular sob tipagem estatica TypeScript e compilada para JavaScript ECMAScript moderno), combinada com estilos puros em CSS3, HTML5 semantico e um motor de API em Python com Django REST Framework. A interface adota uma paleta elegante e contida em **Royal Blue** e **Creme**, com layout minimalista, navegacao fluida, responsividade total e iconografia SVG limpa sem o uso de emojis.

---

## Pilares de Engenharia e Seguranca

Em conformidade com as melhores praticas de seguranca de aplicacoes modernas:

1. **Isolamento de Chaves e Credenciais**: Variaveis sensiveis (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`) sao carregadas via ambiente com `python-dotenv`. O arquivo `.env` e estritamente ignorado pelo versionador (`.gitignore`).
2. **Consultas Parametrizadas**: Toda a persistencia de dados e realizada exclusivamente atraves do ORM do Django, mitigando integralmente riscos de SQL Injection.
3. **Controle de Acesso Baseado em Perfis (Role-Level Security)**: Distincao formal entre administradores, operadores e visualizadores, com tela dedicada de gestao de perfil e tokens (`/perfil`).
4. **Protecao de Campos (Field Tampering)**: Campos criticos como saldos de estoque, timestamps de auditoria e totais financeiros sao marcados como `read_only` nos serializers e calculados exclusivamente no servidor sob transacao atomica (`select_for_update`).
5. **Cookies de Sessao Seguros**: Flags `SESSION_COOKIE_HTTPONLY = True` e `CSRF_COOKIE_HTTPONLY = True` configuradas nativamente.
6. **Headers HTTP de Seguranca**: Protecoes ativas contra clickjacking (`X-Frame-Options: DENY`), mime-sniffing (`X-Content-Type-Options: nosniff`), filtro XSS (`SECURE_BROWSER_XSS_FILTER: True`) e politicas de referencia restritas.
7. **Respostas Enxutas (Trim API Responses)**: Serializers expõem exclusivamente os campos estritamente necessarios, sem vazamento de dados internos de infraestrutura ou senhas.
8. **Validacao Rigorosa no Servidor**: Validacao estrita de tipos, faixas numericas positivas, unicidade de SKUs e precos em camadas de serializacao.

---

## Estrutura do Repositorio

A estrutura do projeto adota organizacao unificada (sem pastas genericas separadas `frontend`/`backend`), agrupando o motor de API e a aplicacao cliente em uma raiz coesa:

```
dreamstorage/
├── api/                           # Motor de regras de negocio (Django REST Framework)
│   ├── authentication/            # Usuarios, permissoes e testes de perfil
│   ├── dreamstorage_core/         # Configuracoes do projeto (settings, urls, asgi/wsgi)
│   └── inventory/                 # Modulo de inventario
│       ├── management/commands/   # Comando seed_data para carga inicial
│       ├── migrations/            # Versionamento de esquemas de banco
│       ├── models.py              # Entidades relacionais (Product, Category, Movement, Alert)
│       ├── serializers.py         # Validacao, atomicidade e regras de negocio
│       ├── tests.py               # Testes automatizados de seguranca e estoque
│       └── views.py               # Endpoints REST e metricas do dashboard
├── src/                           # Aplicacao Angular 21 (Client Architecture)
│   ├── app/
│   │   ├── components/ui/         # Primitivos modulares (Button, Badge, Card)
│   │   ├── core/services/         # Servicos singleton (InventoryService, AuthService, ToastService)
│   │   ├── features/              # Modulos funcionais
│   │   │   ├── categories/        # Gestao de categorias e fornecedores
│   │   │   ├── dashboard/         # Painel analitico e operacoes rapidas
│   │   │   ├── movements/         # Historico e livro-razao de movimentacoes
│   │   │   ├── products/          # Catalogo de itens e controle de saldos
│   │   │   └── profile/           # Perfil de usuario e painel de controle de acesso
│   │   ├── models/                # Interfaces de dados TypeScript
│   │   └── shared/components/     # Componentes globais (Navbar, Sidebar, ToastContainer)
│   ├── styles.css                 # Design Tokens (Royal Blue, Creme, Glass)
│   ├── index.html                 # HTML semantico
│   └── main.ts                    # Ponto de entrada Angular
├── public/                        # Ativos estaticos
├── angular.json                   # Configuracoes de compilacao Angular
├── package.json                   # Dependencias e scripts de execucao Node/Angular
├── requirements.txt               # Dependencias Python consolidadas na raiz
├── manage.py                      # Ponto de entrada unificado para comandos Django
├── .env.example                   # Exemplo de configuracao de variaveis de ambiente
└── README.md
```

---

## Guia de Execucao

### 1. Pre-requisitos
- Node.js 18+ (Node 20+ recomendado)
- Python 3.10+ (Python 3.12+ recomendado)

### 2. Backend (API Django REST)
A partir da raiz do projeto:
```bash
# Instalacao de dependencias
pip install -r requirements.txt

# Execucao de migracoes de banco
python manage.py migrate

# Carga de dados inicial para testes
python manage.py seed_data

# Execucao da suite de testes automatizados
python manage.py test authentication inventory

# Inicializacao do servidor de desenvolvimento
python manage.py runserver 8000
```
A API estara ativa em: `http://localhost:8000/api/`

### 3. Frontend (Interface Angular)
A partir da raiz do projeto:
```bash
# Instalacao de dependencias
npm install

# Compilacao em modo desenvolvimento
npm start
```
A aplicacao estara disponivel em: `http://localhost:4200`

---

## Rotas da API REST

| Metodo | Rota | Descricao |
| :--- | :--- | :--- |
| GET | `/api/` | Verificacao de integridade e mapa da API |
| GET | `/api/inventory/dashboard/` | Metricas consolidadas em tempo real |
| GET, POST | `/api/inventory/products/` | Catalogo e cadastro de produtos |
| POST | `/api/inventory/products/{id}/quick-movement/` | Movimentacao rapida (entrada/saida) |
| GET, POST | `/api/inventory/movements/` | Livro-razao de movimentacoes |
| GET, POST | `/api/inventory/categories/` | Gestao de categorias de itens |
| GET, POST | `/api/inventory/suppliers/` | Gestao de fornecedores homologados |
| GET, POST | `/api/inventory/alerts/` | Consulta e arquivamento de alertas |
| GET | `/api/auth/profile/` | Dados do usuario autenticado e perfil |
