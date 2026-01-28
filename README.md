# Enterprise Angular Auth

> **Aviso para Recrutadores/Tech Leads:** Este repositório não é apenas um formulário de login. É uma demonstração de arquitetura resiliente, desacoplamento e práticas modernas de Engenharia de Frontend (Angular 18+).

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🎯 O Problema de Negócio

A maioria das implementações de autenticação acopla a UI diretamente ao SDK do provedor (Firebase, Auth0, Supabase). Isso cria três problemas críticos em projetos de longa duração:

1.  **Vendor Lock-in:** Mudar de provedor exige refatorar a aplicação inteira.
2.  **Testabilidade:** É difícil testar componentes que dependem diretamente de SDKs externos.
3.  **Inconsistência de Dados:** O formato do usuário (User Payload) varia entre provedores, vazando detalhes de implementação para a UI.

Este projeto resolve isso implementando uma **Clean Architecture** no Frontend.

## 🏗 Arquitetura e Decisões Técnicas

### 1. Gateway Pattern (Port & Adapter)

A decisão mais crítica deste projeto foi **inverter a dependência** da autenticação.

- **Abstração (The Port):** `AuthGateway` (classe abstrata) define o _contrato_ que a aplicação precisa (login, logout, getCurrentUser).
- **Implementação (The Adapter):** `SupabaseAuthGateway` implementa esse contrato usando o SDK do Supabase.
- **Consumo:** O `AuthService` e os componentes conhecem apenas o `AuthGateway`.

**Resultado:** Se amanhã precisarmos migrar para AWS Cognito ou Auth0, basta criar uma nova classe `CognitoAuthGateway` e alterar uma linha no `app.config.ts`. Nenhuma linha de regra de negócio ou componente precisa ser tocada.

### 2. State Management com Signals

Abandonei a complexidade do NgRx para este escopo, optando pela simplicidade e performance dos **Angular Signals**.

- `currentUser`: Um Signal que garante reatividade granular na UI.
- `effect()`: Utilizado no `AuthService` para gerenciar redirecionamentos de segurança (Route Guards reativos) baseados no estado de autenticação, eliminando condições de corrida comuns em SPAs.

### 3. Domain Mapper Pattern

Os dados que vêm do Supabase não são consumidos "crus". Existe uma camada de **Mappers** (`UserMapper`) que sanitiza e transforma o DTO do provedor em uma entidade de domínio `User`. Isso garante que a aplicação lide apenas com dados que ela controla, não com a estrutura do banco de dados.

## 🚀 Stack Tecnológica

- **Core:** Angular (Latest), TypeScript.
- **Estilização:** TailwindCSS (para velocidade de desenvolvimento e consistência de Design System).
- **Backend as a Service:** Supabase (Auth + DB).
- **Qualidade:**
  - **Vitest:** Para testes unitários (mais rápido que Karma/Jasmine).
  - **Cypress:** Para testes E2E (cobrindo fluxos críticos de login/cadastro).
  - **Sentry:** Monitoramento de erros em tempo real.
  - **Zod/Validators:** Validação robusta de formulários.

## 🛠 Como Rodar

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/enterprise-angular-auth.git
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure o Ambiente:**
    Crie um arquivo `src/environments/environment.ts` com suas chaves do Supabase e Sentry:

    ```typescript
    export const environment = {
      production: false,
      supabaseUrl: 'SUA_URL',
      supabaseKey: 'SUA_KEY',
      sentryDsn: 'SEU_DSN_DO_SENTRY',
    };
    ```

4.  **Execute:**
    ```bash
    npm start
    ```

## ⚖️ Trade-offs e Melhorias Futuras

Como todo projeto de engenharia, escolhas foram feitas:

- **Auth via LocalStorage:** Atualmente a persistência é via LocalStorage (padrão do Supabase). Para aplicações bancárias/alta segurança, a migração para **HttpOnly Cookies** seria mandatória para mitigar XSS. Graças ao padrão Gateway, essa mudança seria isolada no Adapter.
- **Signals vs NgRx:** Para o escopo atual, Signals são suficientes. Se a complexidade de estado global aumentasse (ex: cache de permissões complexas, multi-tenant state), NgRx ou Elf seriam considerados.
- **Testes de Integração:** O projeto foca em Unitários e E2E. Testes de integração (Component Testing) seriam o próximo passo para garantir a estabilidade da UI isolada.

---

_Desenvolvido como referência de arquitetura escalável em Angular._
