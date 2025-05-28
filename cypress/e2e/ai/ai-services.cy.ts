describe('AI Services Management', () => {
  let testServiceData: any;
  let invalidServiceData: any;

  before(() => {
    // Load test data
    cy.fixture('ai-services').then((data) => {
      testServiceData = data.validService;
      invalidServiceData = data.invalidService;
    });
  });

  beforeEach(() => {
    // Login as admin user before each test
    cy.loginAsAdmin();
  });

  describe('Page Load and Layout', () => {
    it('should load the AI services page successfully', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Services');
      cy.get('[data-testid="services-container"]').should('be.visible');
    });

    it('should display existing services', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Verify at least the seeded services are present
      cy.get('[data-testid="service-card"]').should('have.length.at.least', 1);
    });

    it('should show create button for authorized users', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      cy.get('[data-testid="create-service-button"]').should('be.visible');
    });
  });

  describe('Service Creation', () => {
    it('should create a new AI service successfully', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-service-button"]').click();
      cy.url().should('include', '/ai/services/create');

      // Fill the form
      cy.fillForm({
        name: testServiceData.name,
        provider: testServiceData.provider,
        description: testServiceData.description,
        api_key: testServiceData.api_key,
        api_url: testServiceData.api_url
      });

      // Submit the form
      cy.intercept('POST', '/ai/services').as('createService');
      cy.get('[data-testid="submit-button"]').click();

      // Wait for the request and verify success
      cy.wait('@createService').then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
      });

      // Verify redirect and success message
      cy.url().should('include', '/ai/services');
      cy.checkToast('success', 'Service created successfully');

      // Verify the new service appears in the list
      cy.get('[data-testid="service-card"]').should('contain', testServiceData.name);
    });

    it('should show validation errors for invalid data', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-service-button"]').click();

      // Try to submit empty form
      cy.get('[data-testid="submit-button"]').click();

      // Verify validation errors are shown
      cy.get('.error-message, .text-red-500').should('be.visible');
    });

    it('should handle form cancellation', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-service-button"]').click();

      // Fill some data
      cy.get('[name="name"]').type('Test Service');

      // Cancel the form
      cy.get('[data-testid="cancel-button"]').click();

      // Verify we're back to the services list
      cy.url().should('include', '/ai/services');
      cy.url().should('not.include', '/create');
    });
  });

  describe('Service Listing and Filtering', () => {
    it('should filter services by provider', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      cy.get('[data-testid="provider-filter"]').click();
      cy.get('[data-value="mistral"]').click();

      // Verify filtered results
      cy.get('[data-testid="service-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="service-provider"]').should('contain', 'mistral');
      });
    });

    it('should filter services by status', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-value="enabled"]').click();

      // Verify filtered results show only enabled services
      cy.get('[data-testid="service-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="service-status"]').should('contain', 'Enabled');
      });
    });

    it('should search services by name', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      cy.get('[data-testid="search-input"]').type('Mistral');
      cy.get('[data-testid="search-input"]').type('{enter}');

      // Verify search results
      cy.get('[data-testid="service-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="service-name"]').should('contain', 'Mistral');
      });
    });
  });

  describe('Service Actions', () => {
    it('should view service details', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Get the first service name
      cy.get('[data-testid="service-card"]').first().find('[data-testid="service-name"]').invoke('text').then((serviceName) => {
        cy.get('[data-testid="service-card"]')
          .contains(serviceName.trim())
          .parent()
          .find('[data-testid="service-actions-button"]')
          .click();
        
        cy.get('[data-testid="view-button"]').click();
        
        // Verify we're on the view page
        cy.url().should('include', '/ai/services/');
        cy.url().should('include', '/show');
      });
    });

    it('should edit service', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Get the first service name
      cy.get('[data-testid="service-card"]').first().find('[data-testid="service-name"]').invoke('text').then((serviceName) => {
        cy.get('[data-testid="service-card"]')
          .contains(serviceName.trim())
          .parent()
          .find('[data-testid="service-actions-button"]')
          .click();
        
        cy.get('[data-testid="edit-button"]').click();
        
        // Verify we're on the edit page
        cy.url().should('include', '/ai/services/');
        cy.url().should('include', '/edit');
        
        // Verify form is pre-filled
        cy.get('[name="name"]').should('have.value', serviceName.trim());
      });
    });

    it('should test service connection', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Get the first service
      cy.get('[data-testid="service-card"]').first().find('[data-testid="service-name"]').invoke('text').then((serviceName) => {
        cy.intercept('POST', `/ai/services/*/test-connection`).as('testConnection');
        
        cy.get('[data-testid="service-card"]')
          .contains(serviceName.trim())
          .parent()
          .find('[data-testid="service-actions-button"]')
          .click();
        
        cy.get('[data-testid="test-connection-button"]').click();
        
        cy.wait('@testConnection');
        cy.checkToast('success', 'Connection test successful');
      });
    });

    it('should set service as default', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Find a non-default service and set it as default
      cy.get('[data-testid="service-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="service-status"]').then(($status) => {
          if (!$status.text().includes('Default')) {
            cy.wrap($card).find('[data-testid="service-name"]').invoke('text').then((serviceName) => {
              cy.intercept('POST', `/ai/services/*/set-default`).as('setDefault');
              
              cy.wrap($card).find('[data-testid="service-actions-button"]').click();
              cy.get('[data-testid="set-default-button"]').click();
              
              cy.wait('@setDefault');
              cy.checkToast('success', 'Service set as default');
            });
            return false; // Exit the loop
          }
        });
      });
    });

    it('should toggle service status', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Get the first service and toggle its status
      cy.get('[data-testid="service-card"]').first().find('[data-testid="service-name"]').invoke('text').then((serviceName) => {
        cy.intercept('POST', `/ai/services/*/toggle-status`).as('toggleStatus');
        
        cy.get('[data-testid="service-card"]')
          .contains(serviceName.trim())
          .parent()
          .find('[data-testid="service-actions-button"]')
          .click();
        
        cy.get('[data-testid="toggle-status-button"]').click();
        
        cy.wait('@toggleStatus');
        cy.checkToast('success');
      });
    });

    it('should delete service with confirmation', () => {
      // First create a test service to delete
      cy.request({
        method: 'POST',
        url: '/ai/services',
        body: {
          ...testServiceData,
          name: 'Service to Delete'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(() => {
        cy.visitAIPage('services');
        cy.waitForPageLoad();

        cy.intercept('DELETE', `/ai/services/*`).as('deleteService');
        
        cy.get('[data-testid="service-card"]')
          .contains('Service to Delete')
          .parent()
          .find('[data-testid="service-actions-button"]')
          .click();
        
        cy.get('[data-testid="delete-button"]').click();
        
        // Confirm deletion in modal
        cy.get('[data-testid="delete-modal"]').should('be.visible');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteService');
        cy.checkToast('success', 'Service deleted successfully');
        
        // Verify service is removed from list
        cy.get('[data-testid="service-card"]').should('not.contain', 'Service to Delete');
      });
    });
  });

  describe('Service Configuration', () => {
    it('should update service configuration', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Edit the first service
      cy.get('[data-testid="service-card"]').first().find('[data-testid="service-name"]').invoke('text').then((serviceName) => {
        cy.get('[data-testid="service-card"]')
          .contains(serviceName.trim())
          .parent()
          .find('[data-testid="service-actions-button"]')
          .click();
        
        cy.get('[data-testid="edit-button"]').click();
        
        // Update configuration
        cy.get('[name="description"]').clear().type('Updated service description');
        
        cy.intercept('PUT', `/ai/services/*`).as('updateService');
        cy.get('[data-testid="submit-button"]').click();
        
        cy.wait('@updateService');
        cy.checkToast('success', 'Service updated successfully');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('GET', '/ai/services', { statusCode: 500 }).as('servicesError');
      
      cy.visitAIPage('services');
      
      cy.wait('@servicesError');
      
      // Verify error message is shown
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should handle connection test failures', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Mock failed connection test
      cy.intercept('POST', `/ai/services/*/test-connection`, { statusCode: 400, body: { message: 'Connection failed' } }).as('failedConnection');
      
      cy.get('[data-testid="service-card"]').first().find('[data-testid="service-actions-button"]').click();
      cy.get('[data-testid="test-connection-button"]').click();
      
      cy.wait('@failedConnection');
      cy.checkToast('error', 'Connection test failed');
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667);
      
      cy.visitAIPage('services');
      cy.waitForPageLoad();

      // Verify mobile layout
      cy.get('[data-testid="service-card"]').should('be.visible');
      cy.get('[data-testid="create-service-button"]').should('be.visible');
    });
  });
});
