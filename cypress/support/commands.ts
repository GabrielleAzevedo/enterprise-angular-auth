/// <reference types="cypress" />

Cypress.Commands.add('login', (email = 'test+e2e@example.com', password = 'SenhaForte1!') => {
  cy.visit('/entrar');

  cy.get('[formControlName="email"]').clear().type(email);
  cy.get('[formControlName="password"]').clear().type(password);

  // Mock de sucesso do login para não depender de usuário real no banco
  cy.intercept('POST', '**/auth/v1/token*', {
    statusCode: 200,
    body: {
      access_token: 'fake-jwt-token-header.fake-jwt-token-payload.fake-jwt-token-signature',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'fake-refresh-token',
      user: {
        id: 'fake-user-id',
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
      },
    },
  }).as('loginRequest');

  // O Cypress pode falhar ao clicar se houver animações ou elementos sobrepostos (ex: toasts).
  // Utiliza { force: true } para garantir a estabilidade em CI, embora o ideal fosse investigar a sobreposição.
  cy.contains('button', 'Entrar').click({ force: true });

  cy.wait('@loginRequest');
});

Cypress.Commands.add('logout', () => {
  cy.visit('/dashboard');
  cy.contains('button', 'Sair').click({ force: true });
});

Cypress.Commands.add('expireSupabaseSession', () => {
  cy.window().then((win) => {
    Object.keys(win.localStorage).forEach((key) => {
      if (key.includes('sb-') && key.includes('-auth-token')) {
        win.localStorage.removeItem(key);
      }
    });
  });
});