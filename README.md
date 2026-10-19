# DreamStorage - Sistema Inteligente de Controle de Estoque

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Angular](https://img.shields.io/badge/Angular_21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)
![Web3](https://img.shields.io/badge/Web3-F16822?style=for-the-badge&logo=web3dotjs&logoColor=white)
![Figma](https://img.shields.io/badge/Figma_Design-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
![Django](https://img.shields.io/badge/Django_5-092E20?style=for-the-badge&logo=django&logoColor=white)
![Django REST](https://img.shields.io/badge/DRF-A30000?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## Visao Geral

O **DreamStorage** e uma solucao empresarial para gestao de inventario, auditoria contabil e controle logistico de estoque, projetada segundo padroes modernos de engenharia de software e design de alta fidelidade (Figma design system). 

A aplicacao utiliza **JavaScript como linguagem de maior uso no frontend** (desenvolvida com o framework Angular 21 sob tipagem estatica TypeScript e compilada para JavaScript ECMAScript moderno), combinada com estilos puros em CSS3, HTML5 semantico, visualizacao 3D interativa com **Three.js**, protocolo **Web3** para auditoria e um motor de API em Python com Django REST Framework. A interface adota uma paleta elegante em **Royal Blue** e **Creme**, com layout minimalista, navegacao fluida, responsividade total e iconografia SVG limpa sem o uso de emojis.

---

## Tecnologias e Inovacoes Integradas

### 1. Gemeo Digital 3D do Armazem (Three.js)
- Visualizacao tridimensional interativa do armazem com iluminacao em tempo real, grid holografico e estantes metalicas multi-niveis.
- Paletes e caixas com cores categorizadas e densidades proporcionais ao estoque fisico.
- Orbitacao 360 graus com mouse e gestos de toque, zoom suave e redefinicao de perspectiva da camera.
- Particulas de telemetria em suspensao simulando o ambiente do armazem.

### 2. Auditoria Criptografica e Ledger Web3
- Conexao com carteiras Web3 compativeis com o padrao EIP-1193 (MetaMask, Brave Wallet, Coinbase Wallet).
- Geracao de hashes SHA-256 para cada movimentacao de estoque e despacho logistico, assegurando a imutabilidade do livro-razao.
- Emissao de comprovantes criptograficos on-chain e contadores de auditoria descentralizada.

### 3. Design System de Alta Fidelidade (Padrao Figma)
- Sistema estruturado de tokens: paleta Royal Blue, tons cremes com acabamento dourado, radii consistentes e elevacoes em blur com saturacao calibrada.
- Componentes com microinteracoes tatil-reativas nos estados hover e active.
- Ausencia de poluicao visual, mantendo uma experiencia de usuario fluida e profissional.

### 4. Arquivamento Seguro de Itens (Soft-Archive)
- Produtos descontinuados ou fora de linha podem ser arquivados registrando motivo e data.
- Todos os registros historicos, movimentacoes previas e saldos contabeis sao preservados integralmente para auditorias fiscais.
- Alternancia instantanea entre produtos Ativos, Arquivados e Todos, com reativacao em um clique.

### 5. Integracao com Sites de Entregas & Rastreamento Oficial
- Expedicao direta a partir do catalogo com baixa transacional atomica via `select_for_update`.
- Codigos padronizados por transportadora (Correios, Loggi, Melhor Envio, Jadlog e Expressa).
- Conexao direta com as URLs oficiais de rastreamento das transportadoras.
- Painel logistico dedicado de entregas em `/entregas`.

---

## Estrutura do Repositorio

```
dreamstorage/
├── api/
│   ├── authentication/
│   ├── dreamstorage_core/
│   └── inventory/
│       ├── management/commands/
│       ├── migrations/
│       ├── models.py
│       ├── serializers.py
│       ├── tests.py
│       └── views.py
├── src/
│   ├── app/
│   │   ├── components/ui/
│   │   ├── core/services/
│   │   ├── features/
│   │   │   ├── categories/
│   │   │   ├── dashboard/
│   │   │   ├── deliveries/
│   │   │   ├── movements/
│   │   │   ├── products/
│   │   │   └── profile/
│   │   ├── models/
│   │   └── shared/components/
│   │       ├── navbar/
│   │       ├── sidebar/
│   │       ├── toast-container/
│   │       └── warehouse-3d/
│   ├── styles.css
│   ├── index.html
│   └── main.ts
├── public/
├── angular.json
├── package.json
├── requirements.txt
├── manage.py
├── .env.example
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
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py test inventory authentication
python manage.py runserver 8000
```
A API estara ativa em: `http://localhost:8000/api/`

### 3. Frontend (Interface Angular)
A partir da raiz do projeto:
```bash
npm install
npm start
```
A aplicacao estara disponivel em: `http://localhost:4200`

---

## Rotas da API REST

| Metodo | Rota | Descricao |
| :--- | :--- | :--- |
| GET | `/api/` | Verificacao de integridade e mapa da API |
| GET | `/api/inventory/dashboard/` | Metricas consolidadas em tempo real |
| GET, POST | `/api/inventory/products/` | Catalogo e cadastro de produtos (suporta `?archived=true\|false\|all`) |
| POST | `/api/inventory/products/{id}/archive/` | Arquiva produto preservando historico contabil |
| POST | `/api/inventory/products/{id}/unarchive/` | Reativa produto no catalogo ativo |
| POST | `/api/inventory/products/{id}/dispatch-delivery/` | Despacha produto gerando rastreio e baixando estoque |
| POST | `/api/inventory/products/{id}/quick-movement/` | Movimentacao rapida (entrada/saida) |
| GET, POST | `/api/inventory/deliveries/` | Listagem e criacao de ordens de entrega logistica |
| POST | `/api/inventory/deliveries/{id}/update_status/` | Atualizacao do status do rastreio de entrega |
| GET, POST | `/api/inventory/movements/` | Livro-razao de movimentacoes e auditoria |
| GET, POST | `/api/inventory/categories/` | Gestao de categorias de itens |
| GET, POST | `/api/inventory/suppliers/` | Gestao de fornecedores homologados |
| GET, POST | `/api/inventory/alerts/` | Consulta e resolucao de alertas de estoque |
| GET | `/api/auth/profile/` | Dados do usuario autenticado e perfil |
