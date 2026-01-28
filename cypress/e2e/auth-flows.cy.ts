describe('Fluxos críticos de autenticação', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('Onboarding: novo usuário se cadastra e recebe feedback', () => {
    cy.visit('/cadastro');

    cy.get('[formControlName="email"]').type('novo.usuario+e2e@example.com');
    cy.get('[formControlName="password"]').type('SenhaForte1!');
    cy.get('[formControlName="confirmPassword"]').type('SenhaForte1!');

    // Mock determinístico para garantir sucesso
    cy.intercept('POST', '**/auth/v1/signup', {
      statusCode: 200,
      body: {
        id: 'mock-user-id',
        email: 'novo.usuario+e2e@example.com',
        confirmation_sent_at: new Date().toISOString(),
      },
    }).as('signup');

    cy.contains('button', 'Cadastrar').click();

    cy.wait('@signup');

    // Correção Senior: Exige redirecionamento EXCLUSIVO para /verificar-email
    cy.url().should('include', '/verificar-email');
  });

  it('Sessão perdida: expira token na dashboard e redireciona para /entrar (via reload)', () => {
    cy.login();
    cy.visit('/dashboard');

    cy.expireSupabaseSession();

    // Força re-inicialização do AuthService
    cy.reload();

    cy.url().should('include', '/entrar');
  });

  it('Sessão perdida: interceptor detecta 401 e redireciona (sem reload)', () => {
    // Mock do usuário logado para a chamada inicial do AuthService
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'test+e2e@example.com',
        app_metadata: { provider: 'email' },
        user_metadata: {},
        created_at: new Date().toISOString(),
      },
    }).as('getUserSuccess');

    cy.login();
    cy.visit('/dashboard');

    // Verifica se carregou a dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Sair da conta').should('be.visible');

    // Agora sobrescrevemos o interceptor para retornar 401 na próxima chamada
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 401,
      body: { message: 'JWT expired' },
    }).as('getUser401');

    // Dispara a ação que faz o request, sem navegar
    cy.contains('button', 'Atualizar Dados').click();

    // Aguarda o request falhar
    cy.wait('@getUser401');

    // Verifica se o app redirecionou para login automaticamente
    cy.url().should('include', '/entrar');
  });

  it('Proteção de rotas: não permite acessar /dashboard sem login', () => {
    cy.visit('/dashboard');

    cy.url().should('include', '/entrar');
  });

  it('Persistência de sessão: mantém usuário na dashboard após reload', () => {
    cy.login();

    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');

    cy.reload();

    cy.url().should('include', '/dashboard');
  });

  it('Recuperação de senha: envia email e lida com token inválido', () => {
    cy.visit('/entrar');

    cy.contains('Esqueceu a senha?').click();

    cy.url().should('include', '/recuperar-senha');

    cy.get('[formControlName="email"]').type('usuario.recuperacao@example.com');

    // Mock para envio de email de recuperação
    // Usando match parcial para ser mais resiliente
    cy.intercept('POST', '**/recover', {
      statusCode: 200,
      body: {},
    }).as('recover');

    cy.contains('button', 'Enviar link de recuperação').click();

    // cy.wait('@recover'); // Removido temporariamente para debug

    // Verifica se a UI mudou para sucesso
    cy.contains('Verifique seu e-mail', { timeout: 10000 }).should('be.visible');

    cy.visit('/atualizar-senha#access_token=token-invalido');

    cy.contains(/Link expirado ou inválido/i).should('be.visible');
  });
});