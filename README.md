# Catálogo Inteligente - Cloud Project (UNIFOR GRUPO 5)

Este projeto consiste em um sistema de gerenciamento de estoque **Full-Stack** e **Cloud-Native**, desenvolvido como atividade prática para a disciplina de Desenvolvimento de Software em Nuvem na Universidade de Fortaleza (UNIFOR). A aplicação foca em escalabilidade, segurança via tokens e isolamento de ambiente através de containers.

# Tecnologias e Serviços

**Front-end:** Interface SPA (Single Page Application) construída com **React + Vite**, utilizando Hooks (useState, useEffect) para gerenciamento de estado reativo e CSS modularizado.
**Back-end:** API RESTful desenvolvida em Node.js + Express, operando em ambiente conteinerizado (Docker).
**Segurança (Auth):** Autenticação via Firebase Authentication com validação de **ID Tokens (JWT)** no lado do servidor.
**Banco de Dados (PaaS):** Cloud Firestore (Google Cloud NoSQL) para persistência escalável e global.
**DevOps/Infra:** Docker (Containerização), WSL 2 para paridade de ambiente e arquitetura pronta para Deploy em Nuvem.

# Arquitetura do Sistema

O sistema foi desenhado seguindo o modelo de micro-serviços desacoplados para garantir que a aplicação seja **Stateless** (sem estado):

1. **Camada de Identidade:** O usuário realiza o handshake diretamente com o Firebase. O Token gerado é armazenado no `localStorage` do navegador para manter a sessão ativa.
2. **Middleware de Segurança:** No Back-end, as rotas sensíveis (POST, PUT, DELETE) utilizam um interceptador que valida o Token JWT antes de interagir com o banco de dados Firestore.
3. **Persistência Independente:** O banco de dados reside fora do container. Isso permite que o container seja destruído e recriado sem qualquer perda de dados, seguindo os princípios de infraestrutura imutável.

# Segurança e Regras de Negócio (CRUD)

* **Leitura (Pública):** Visualização do estoque disponível para qualquer usuário.
* **Escrita (Protegida):** Operações de Criar, Editar e Excluir exigem um Token de autenticação válido enviado no cabeçalho `Authorization`.

# Como Executar o Projeto

# Pré-requisitos
* Node.js instalado (v18 ou superior).
* Docker Desktop configurado e rodando.
* Possuir o arquivo `firebase-key.json` na raiz da pasta `/backend`.
* Arquivo `.env` configurado com as credenciais do Firebase.

## Passo a Passo via Terminal

### 1. Iniciar o Back-end (Docker)
```bash
cd backend
docker build -t catalogo-backend .
docker run -p 3000:3000 --env-file .env catalogo-backend

O servidor estará operacional em: http://localhost:3000
```
### 2. Iniciar o Front-end (React + Vite)
Abra um novo terminal e execute:
```bash
cd frontend-react
npm install
npm run dev

Acesse a aplicação em: http://localhost:5173
```

# Equipe e Papéis (Requisito UNIFOR)

*Ian Aureliano Freire*: Arquiteto de Software, Desenvolvedor Full-stack, Documentação e Integração
*Henri Aureliano Freire*: Engenheiro DevOps, Responsável por Qualidade e Testes


# Dificuldades e Soluções Técnicas
Migração de Paradigma (Vanilla para React): A transição exigiu a reestruturação da lógica de manipulação do DOM para um modelo reativo baseado em estados (useState), garantindo que a interface atualize automaticamente após operações de CRUD sem recarregar a página.

Integração de SDKs em SPA: Resolvemos o desafio de carregar o Firebase Globalmente no ambiente do Vite, garantindo que o window.firebase estivesse disponível para autenticação antes da montagem dos componentes React.

Sincronização de Estado Reativo: Implementamos uma lógica de formulário dinâmico que alterna entre os métodos POST (Criação) e PUT (Edição) baseada na presença de um ID no estado, otimizando o reuso de componentes de interface.

Infraestrutura Cloud-Ready: Superamos desafios de CORS e alocação de portas no Docker, permitindo que o Front-end em React se comunicasse de forma transparente com o container Node.js, simulando um ambiente de produção real.