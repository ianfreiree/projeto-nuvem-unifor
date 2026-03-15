# Catálogo Inteligente - Cloud Project (UNIFOR)

Este projeto consiste em um sistema de gerenciamento de estoque **Full-Stack** e **Cloud-Native**, desenvolvido como atividade prática para a disciplina de Desenvolvimento de Software em Nuvem na Universidade de Fortaleza (UNIFOR). A aplicação foca em escalabilidade, segurança via tokens e isolamento de ambiente através de containers Docker.

---

# Links de Acesso (Produção)
* Front-end (Vercel): [https://projeto-nuvem-unifor.vercel.app](https://projeto-nuvem-unifor.vercel.app)
* API/Back-end (Render): [https://projeto-nuvem-unifor.onrender.com](https://projeto-nuvem-unifor.onrender.com)
* Documentação da API (Swagger/OpenAPI): [https://projeto-nuvem-unifor.onrender.com/api-docs](https://projeto-nuvem-unifor.onrender.com/api-docs)
*Vídeo do nosso projeto (Youtube): (https://www.youtube.com/watch?v=ZwVzveC7FhE)


---

# Tecnologias e Serviços

* **Front-end:** Interface SPA construída com **React + Vite**, utilizando Hooks (`useState`, `useEffect`) para gerenciamento de estado reativo e CSS modularizado.
* **Back-end:** API RESTful desenvolvida em **Node.js + Express**, operando em ambiente conteinerizado via **Docker**.
* **Segurança (Auth):** Autenticação via **Firebase Authentication** com validação de **ID Tokens (JWT)** no lado do servidor.
* **Banco de Dados (PaaS):** **Cloud Firestore** (Google Cloud NoSQL) para persistência escalável e global.
* **Hospedagem & Infra:** * **Vercel:** Deploy contínuo do Front-end.
    * **Render:** Hospedagem do Back-end Dockerizado com gerenciamento de **Secret Files**.

---

# Arquitetura do Sistema

O sistema foi desenhado seguindo o modelo de micro-serviços desacoplados e **Stateless**:

1. **Camada de Identidade:** O handshake de login é feito diretamente com o Firebase. O Token JWT gerado é armazenado no `localStorage` para persistência de sessão.
2. **Middleware de Segurança:** No Back-end, as rotas críticas (`POST`, `PUT`, `DELETE`) utilizam um interceptador que valida o Token antes de qualquer interação com o Firestore.
3. **Infraestrutura Imutável:** O Back-end roda dentro de um container Docker no Render. As credenciais sensíveis (`firebase-key.json`) são injetadas em tempo de execução via **Secret Files**, mantendo o repositório seguro e em conformidade com as boas práticas de DevOps.

---

# Regras de Negócio (CRUD)

* **Leitura:** Visualização do catálogo disponível para usuários autenticados.
* **Escrita (Protegida):** Operações de criar, editar e excluir exigem Token válido e sanitização de dados no servidor.

---

# Credenciais para Avaliação
Para testar as rotas protegidas (CRUD), utilize o login abaixo no Front-end:

*Usuário:* professor@unifor.br

*Senha:* unifor123

----

# Como Executar o Projeto (Desenvolvimento)

# 1. Iniciar o Back-end (Docker)
```bash
cd backend
```
# Certifique-se de ter o arquivo firebase-key.json na pasta
```bash
docker build -t catalogo-backend .
docker run -p 3000:3000 catalogo-backend
```
# Dificuldades e Soluções Técnicas (Atualizado)
**Gestão de Credenciais em Nuvem:** Superamos o desafio de segurança ao não subir o arquivo firebase-key.json para o GitHub, utilizando a funcionalidade de Secret Files do Render para manter a conexão com o banco de dados em produção.

**Sincronização de Tipos (Bad Request):** Corrigimos erros de 400 Bad Request implementando a conversão explícita de tipos no Front-end (parseFloat), garantindo que o preço chegue ao servidor como número e não como string.

**Roteamento Dinâmico no Deploy:** Ajustamos as rotas de PUT e DELETE para mapear corretamente os IDs dos documentos no Firestore (/produtos/:id), eliminando erros de 404 Not Found durante a edição de itens.

**Ajustes de CORS:** Configuramos o middleware de CORS no Express para permitir a comunicação segura entre o domínio da Vercel e o servidor no Render.

# Equipe e Papéis (UNIFOR - Grupo 5)
*Ian Aureliano Freire:* Arquiteto de Software, Desenvolvedor Full-stack.
*Henri Aureliano Freire:* Engenheiro DevOps, Responsável por Qualidade e Testes.

**Observabilidade e Logs:** Implementamos um middleware de log customizado no Express que registra cada requisição (Método, URL e Timestamp) no console do servidor. Isso permitiu o monitoramento em tempo real da saúde da aplicação através do dashboard do Render.
