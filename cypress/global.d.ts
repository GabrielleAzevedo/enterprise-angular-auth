/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Comando customizado para realizar login
     * @example cy.login('email@exemplo.com', 'senha123')
     */
    login(email?: string, password?: string): Chainable<void>;

    /**
     * Comando customizado para realizar logout
     * @example cy.logout()
     */
    logout(): Chainable<void>;

    /**
     * Comando customizado para expirar a sessão do Supabase no localStorage
     * @example cy.expireSupabaseSession()
     */
    expireSupabaseSession(): Chainable<void>;
  }
}
