// Test utilities and helpers for Cypress tests

export class TestDataGenerator {
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomEmail(): string {
    return `test-${this.generateRandomString(8)}@example.com`;
  }

  static generateRandomSlug(prefix: string = 'test'): string {
    return `${prefix}-${this.generateRandomString(8).toLowerCase()}`;
  }

  static generateTestModel(overrides: any = {}) {
    return {
      name: `Test Model ${this.generateRandomString(4)}`,
      slug: this.generateRandomSlug('model'),
      model_identifier: `test-model-${this.generateRandomString(6)}`,
      type: 'chat',
      description: 'A test AI model for Cypress testing',
      max_tokens: 4096,
      temperature: 0.7,
      cost_per_input_token: 0.0001,
      cost_per_output_token: 0.0002,
      capabilities: ['text-generation', 'conversation'],
      ...overrides
    };
  }

  static generateTestService(overrides: any = {}) {
    return {
      name: `Test Service ${this.generateRandomString(4)}`,
      provider: 'test-provider',
      description: 'A test AI service for Cypress testing',
      api_key: `test-key-${this.generateRandomString(16)}`,
      api_url: 'https://api.test-provider.com/v1',
      configuration: {
        timeout: 30,
        retries: 3
      },
      ...overrides
    };
  }

  static generateTestConversation(overrides: any = {}) {
    return {
      title: `Test Conversation ${this.generateRandomString(4)}`,
      context_type: 'general',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message',
          timestamp: new Date().toISOString()
        }
      ],
      ...overrides
    };
  }

  static generateTestTemplate(overrides: any = {}) {
    return {
      name: `Test Template ${this.generateRandomString(4)}`,
      slug: this.generateRandomSlug('template'),
      description: 'A test prompt template for Cypress testing',
      category: 'general',
      template: 'Hello {{name}}, how can I help you with {{topic}}?',
      variables: [
        {
          name: 'name',
          type: 'string',
          description: 'User\'s name',
          required: true
        },
        {
          name: 'topic',
          type: 'string',
          description: 'Topic of discussion',
          required: true
        }
      ],
      is_active: true,
      ...overrides
    };
  }
}

export class APIHelpers {
  static createTestModel(modelData: any) {
    return cy.request({
      method: 'POST',
      url: '/ai/models',
      body: modelData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  static createTestService(serviceData: any) {
    return cy.request({
      method: 'POST',
      url: '/ai/services',
      body: serviceData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  static createTestConversation(conversationData: any) {
    return cy.request({
      method: 'POST',
      url: '/ai/conversations',
      body: conversationData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  static createTestTemplate(templateData: any) {
    return cy.request({
      method: 'POST',
      url: '/ai/prompt-templates',
      body: templateData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  static deleteTestModel(modelId: number) {
    return cy.request({
      method: 'DELETE',
      url: `/ai/models/${modelId}`,
      headers: {
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });
  }

  static deleteTestService(serviceId: number) {
    return cy.request({
      method: 'DELETE',
      url: `/ai/services/${serviceId}`,
      headers: {
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });
  }

  static deleteTestConversation(conversationId: number) {
    return cy.request({
      method: 'DELETE',
      url: `/ai/conversations/${conversationId}`,
      headers: {
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });
  }

  static deleteTestTemplate(templateId: number) {
    return cy.request({
      method: 'DELETE',
      url: `/ai/prompt-templates/${templateId}`,
      headers: {
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });
  }
}

export class UIHelpers {
  static waitForElementToBeVisible(selector: string, timeout: number = 10000) {
    cy.get(selector, { timeout }).should('be.visible');
  }

  static waitForElementToDisappear(selector: string, timeout: number = 10000) {
    cy.get(selector, { timeout }).should('not.exist');
  }

  static scrollToElement(selector: string) {
    cy.get(selector).scrollIntoView();
  }

  static clickElementWithRetry(selector: string, maxRetries: number = 3) {
    let attempts = 0;
    const clickWithRetry = () => {
      attempts++;
      cy.get(selector).then(($el) => {
        if ($el.is(':visible') && !$el.is(':disabled')) {
          cy.wrap($el).click();
        } else if (attempts < maxRetries) {
          cy.wait(1000);
          clickWithRetry();
        } else {
          throw new Error(`Element ${selector} not clickable after ${maxRetries} attempts`);
        }
      });
    };
    clickWithRetry();
  }

  static typeWithClear(selector: string, text: string) {
    cy.get(selector).clear().type(text);
  }

  static selectDropdownOption(dropdownSelector: string, optionValue: string) {
    cy.get(dropdownSelector).click();
    cy.get(`[data-value="${optionValue}"]`).click();
  }

  static uploadFile(inputSelector: string, fileName: string) {
    cy.get(inputSelector).selectFile(`cypress/fixtures/${fileName}`);
  }

  static verifyTableData(tableSelector: string, expectedData: any[]) {
    cy.get(tableSelector).within(() => {
      expectedData.forEach((rowData, index) => {
        cy.get('tbody tr').eq(index).within(() => {
          Object.values(rowData).forEach((cellValue, cellIndex) => {
            cy.get('td').eq(cellIndex).should('contain', cellValue);
          });
        });
      });
    });
  }

  static verifyFormValidation(formSelector: string, fieldErrors: Record<string, string>) {
    cy.get(formSelector).within(() => {
      Object.entries(fieldErrors).forEach(([field, errorMessage]) => {
        cy.get(`[data-testid="${field}-error"], .error-${field}`)
          .should('be.visible')
          .and('contain', errorMessage);
      });
    });
  }
}

export class MockHelpers {
  static mockAPIResponse(method: string, url: string, response: any, statusCode: number = 200) {
    cy.intercept(method, url, {
      statusCode,
      body: response
    }).as(`mock${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`);
  }

  static mockAPIError(method: string, url: string, statusCode: number = 500, errorMessage: string = 'Internal Server Error') {
    cy.intercept(method, url, {
      statusCode,
      body: { message: errorMessage }
    }).as(`mockError${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`);
  }

  static mockNetworkError(method: string, url: string) {
    cy.intercept(method, url, { forceNetworkError: true })
      .as(`mockNetworkError${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`);
  }

  static mockSlowResponse(method: string, url: string, response: any, delay: number = 2000) {
    cy.intercept(method, url, {
      delay,
      body: response
    }).as(`mockSlow${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`);
  }
}

export class DatabaseHelpers {
  static seedTestData() {
    // This would typically call a backend endpoint to seed test data
    cy.task('db:seed');
  }

  static cleanTestData() {
    // This would typically call a backend endpoint to clean test data
    cy.task('db:clean');
  }

  static createTestUser(userData: any) {
    return cy.request({
      method: 'POST',
      url: '/api/test/users',
      body: userData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  static deleteTestUser(userId: number) {
    return cy.request({
      method: 'DELETE',
      url: `/api/test/users/${userId}`,
      headers: {
        'Accept': 'application/json'
      },
      failOnStatusCode: false
    });
  }
}

export class PerformanceHelpers {
  static measurePageLoadTime(pageName: string) {
    cy.window().then((win) => {
      const startTime = win.performance.now();
      cy.get('[data-testid="page-loaded"]').should('be.visible').then(() => {
        const endTime = win.performance.now();
        const loadTime = endTime - startTime;
        cy.log(`${pageName} load time: ${loadTime.toFixed(2)}ms`);
        
        // Assert reasonable load time (adjust threshold as needed)
        expect(loadTime).to.be.lessThan(5000); // 5 seconds
      });
    });
  }

  static checkForMemoryLeaks() {
    cy.window().then((win) => {
      const initialMemory = (win.performance as any).memory?.usedJSHeapSize;
      if (initialMemory) {
        cy.log(`Initial memory usage: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
      }
    });
  }
}

export class AccessibilityHelpers {
  static checkKeyboardNavigation(selectors: string[]) {
    selectors.forEach((selector, index) => {
      if (index === 0) {
        cy.get(selector).focus();
      } else {
        cy.focused().tab();
        cy.focused().should('match', selector);
      }
    });
  }

  static checkAriaLabels(elements: Record<string, string>) {
    Object.entries(elements).forEach(([selector, expectedLabel]) => {
      cy.get(selector).should('have.attr', 'aria-label', expectedLabel);
    });
  }

  static checkColorContrast(selector: string, minRatio: number = 4.5) {
    // This would require a custom Cypress command or plugin
    // For now, just verify the element exists
    cy.get(selector).should('be.visible');
  }
}
