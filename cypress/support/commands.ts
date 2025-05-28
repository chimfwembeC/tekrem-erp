/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as admin user
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>
      
      /**
       * Custom command to login as staff user
       * @example cy.loginAsStaff()
       */
      loginAsStaff(): Chainable<void>
      
      /**
       * Custom command to login with custom credentials
       * @example cy.loginAs('user@example.com', 'password')
       */
      loginAs(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to navigate to AI module pages
       * @example cy.visitAIPage('models')
       */
      visitAIPage(page: 'dashboard' | 'models' | 'services' | 'conversations' | 'prompt-templates'): Chainable<void>
      
      /**
       * Custom command to wait for page to load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * Custom command to check if element has data-testid
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to fill form fields
       * @example cy.fillForm({ name: 'Test', email: 'test@example.com' })
       */
      fillForm(fields: Record<string, string>): Chainable<void>
      
      /**
       * Custom command to check toast notifications
       * @example cy.checkToast('success', 'Item created successfully')
       */
      checkToast(type: 'success' | 'error' | 'warning' | 'info', message?: string): Chainable<void>
      
      /**
       * Custom command to wait for API request
       * @example cy.waitForAPI('POST', '/api/ai/models')
       */
      waitForAPI(method: string, url: string): Chainable<void>
    }
  }
}

// Login as admin user
Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginAs(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
});

// Login as staff user
Cypress.Commands.add('loginAsStaff', () => {
  cy.loginAs(Cypress.env('staffEmail'), Cypress.env('staffPassword'));
});

// Login with custom credentials
Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.get('body').should('not.contain', 'These credentials do not match our records');
  });
});

// Logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Navigate to AI module pages
Cypress.Commands.add('visitAIPage', (page: string) => {
  const urls = {
    dashboard: Cypress.env('aiDashboardUrl'),
    models: Cypress.env('aiModelsUrl'),
    services: Cypress.env('aiServicesUrl'),
    conversations: Cypress.env('aiConversationsUrl'),
    'prompt-templates': Cypress.env('aiPromptTemplatesUrl'),
  };
  
  cy.visit(urls[page]);
  cy.waitForPageLoad();
});

// Wait for page to load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="loading"]').should('not.exist');
});

// Get element by test ID
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Fill form fields
Cypress.Commands.add('fillForm', (fields: Record<string, string>) => {
  Object.entries(fields).forEach(([field, value]) => {
    cy.get(`[name="${field}"], [data-testid="${field}"]`).clear().type(value);
  });
});

// Check toast notifications
Cypress.Commands.add('checkToast', (type: string, message?: string) => {
  cy.get('[data-sonner-toaster]').should('be.visible');
  if (message) {
    cy.get('[data-sonner-toaster]').should('contain', message);
  }
});

// Wait for API request
Cypress.Commands.add('waitForAPI', (method: string, url: string) => {
  cy.intercept(method, url).as('apiRequest');
  cy.wait('@apiRequest');
});

export {};
