# Enterprise Angular Auth Architecture

> **Aviso para Tech Leads & Recrutadores:** Este não é um "projeto de portfólio" comum. É uma implementação de referência demonstrando padrões de **Engenharia de Software Sênior** aplicados ao ecossistema Angular moderno (v21+).

![Angular](https://img.shields.io/badge/Angular-21+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Coverage-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![Clean Arch](https://img.shields.io/badge/Architecture-Clean-0052CC?style=for-the-badge&logo=architecture&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth-181818?style=for-the-badge&logo=supabase&logoColor=white)

## 🎯 Diferenciais de Engenharia

Este projeto entrega código que **escala, resiste a falhas e é testável**.

### 1. Concorrência e Resiliência (The "Hard Stuff")

Implementação de um **HTTP Interceptor com Mutex e Queueing**.

- **Cenário:** O token expira e o usuário faz 5 requisições simultâneas.
- **Abordagem:** O interceptor detecta a primeira falha, bloqueia as outras requisições, faz **um único** refresh, e então libera a fila processando as requisições pendentes com o novo token.
- **Prova:** Teste unitário `deve lidar com concorrência (mutex)` em `auth.interceptor.spec.ts`.

### 2. Clean Architecture & Port/Adapter

Inversão de dependência total. O Core da aplicação não sabe que o Supabase existe.

- **Port (Contrato):** `AuthGateway` (abstrato).
- **Adapter (Implementação):** `SupabaseAuthGateway`.
- **Benefício:** Migrar para Auth0 ou AWS Cognito requer apenas criar um novo Adapter, sem tocar em uma única linha de regra de negócio ou componente de UI.

### 3. State Management "No-Boilerplate"

Sem NgRx, sem complexidade desnecessária, mas com controle total.

- **Padrão:** Service-based State com Signals.
- **Segurança de Estado:** `AuthState` expõe sinais **Read-Only** (`currentUser`, `isAuthenticated`) publicamente, mantendo os métodos de escrita (`set`, `update`) privados. Isso impede corrupção de estado acidental por componentes.
- **Facade Pattern:** O `AuthService` atua como fachada, orquestrando chamadas ao Gateway, atualizações no State e efeitos colaterais (Router), simplificando o consumo pelos componentes.

### 4. Estratégia de Testes (Quality Gates)

- **Unitários (Vitest):** Rodando em JSDOM para velocidade.
- **Componentes:** Testes de integração de UI (ex: `RegisterComponent` validando feedback visual de Toasts).
- **Isolamento:** Uso de `MockProvider` e injeção de dependência para testar serviços isolados do backend real.

## 🏗 Estrutura do Projeto

```
src/app/
├── core/                  # Singleton Services, Guards, Interceptors
│   ├── adapters/          # Implementações concretas (Supabase)
│   ├── gateways/          # Contratos abstratos (Ports)
│   ├── services/          # Lógica de Negócio e Estado (AuthService, AuthState)
│   └── interceptors/      # Manipulação HTTP Global
├── features/              # Módulos de Funcionalidade (Lazy Loaded)
│   ├── auth/              # Login, Register, Password Recovery
│   └── dashboard/         # Área protegida
└── shared/                # UI Components (Dumb Components)
```

## 🚀 Como Rodar

### Pré-requisitos

- Node.js 20+
- NPM 10+

### Instalação

```bash
git clone https://github.com/seu-usuario/enterprise-angular-auth.git
npm install
```

### Configuração

Crie o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'SUA_URL_DO_SUPABASE',
  supabaseKey: 'SUA_ANON_KEY',
  sentryDsn: 'OPCIONAL_DSN_SENTRY',
};
```

### Scripts

- **Dev Server:** `npm start`
- **Testes Unitários:** `npm test` (Powered by Vitest)
- **Build de Produção:** `npm run build`

## ⚖️ Decisões Técnicas & Trade-offs

| Decisão                   | Motivação                                          | Trade-off                                                                                                           |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Signals vs NgRx**       | Reduzir boilerplate mantendo reatividade granular. | Menos ferramentas de devtools (Time Travel) que o NgRx oferece, mas suficiente para este escopo.                    |
| **LocalStorage**          | Padrão do Supabase JS Client.                      | Vulnerável a XSS se houver injeção de script. Em ambiente bancário, migraria para **HttpOnly Cookies** via Adapter. |
| **TailwindCSS**           | Velocidade de UI e padronização.                   | HTML verboso, mas mitigado com extração de componentes (`@apply` usado com moderação).                              |
| **Standalone Components** | Modernidade e Tree-shaking.                        | Exige familiaridade com a nova API de injeção do Angular 15+.                                                       |

---

_Este projeto é mantido como referência de arquitetura para aplicações Angular de alta escala._
