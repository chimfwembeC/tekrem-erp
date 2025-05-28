import { AIModelsPage } from '../../support/page-objects/ai-models.page';

describe('AI Models Management', () => {
  const modelsPage = new AIModelsPage();
  let testModelData: any;
  let invalidModelData: any;

  before(() => {
    // Load test data
    cy.fixture('ai-models').then((data) => {
      testModelData = data.validModel;
      invalidModelData = data.invalidModel;
    });
  });

  beforeEach(() => {
    // Login as admin user before each test
    cy.loginAsAdmin();
  });

  describe('Page Load and Layout', () => {
    it('should load the AI models page successfully', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .verifyPageTitle()
        .verifyModelsContainer();
    });

    it('should display existing models', () => {
      modelsPage
        .visit()
        .waitForLoad();

      // Verify at least the seeded models are present
      cy.get('[data-testid="model-card"]').should('have.length.at.least', 1);
    });

    it('should show create button for authorized users', () => {
      modelsPage
        .visit()
        .waitForLoad();

      cy.get('[data-testid="create-model-button"]').should('be.visible');
    });
  });

  describe('Model Creation', () => {
    it('should create a new AI model successfully', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .clickCreateButton();

      // Verify we're on the create page
      cy.url().should('include', '/ai/models/create');

      // Fill the form
      modelsPage.fillModelForm(testModelData);

      // Submit the form
      cy.intercept('POST', '/ai/models').as('createModel');
      modelsPage.submitForm();

      // Wait for the request and verify success
      cy.wait('@createModel').then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
      });

      // Verify redirect to models list
      cy.url().should('include', '/ai/models');

      // Verify success notification
      cy.checkToast('success', 'Model created successfully');

      // Verify the new model appears in the list
      modelsPage.verifyModelExists(testModelData.name);
    });

    it('should show validation errors for invalid data', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .clickCreateButton();

      // Try to submit empty form
      modelsPage.submitForm();

      // Verify validation errors are shown
      cy.get('.error-message, .text-red-500').should('be.visible');
      cy.get('[data-testid="name-error"]').should('contain', 'Name is required');
    });

    it('should handle form cancellation', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .clickCreateButton();

      // Fill some data
      cy.get('[name="name"]').type('Test Model');

      // Cancel the form
      modelsPage.cancelForm();

      // Verify we're back to the models list
      cy.url().should('include', '/ai/models');
      cy.url().should('not.include', '/create');
    });
  });

  describe('Model Listing and Filtering', () => {
    it('should filter models by service', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .filterByService('mistral');

      // Verify filtered results
      cy.get('[data-testid="model-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="model-service"]').should('contain', 'Mistral');
      });
    });

    it('should filter models by type', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .filterByType('chat');

      // Verify filtered results
      cy.get('[data-testid="model-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="model-type"]').should('contain', 'chat');
      });
    });

    it('should filter models by status', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .filterByStatus('enabled');

      // Verify filtered results show only enabled models
      cy.get('[data-testid="model-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="model-status"]').should('contain', 'Enabled');
      });
    });

    it('should search models by name', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .searchModels('Mistral');

      // Verify search results
      cy.get('[data-testid="model-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="model-name"]').should('contain', 'Mistral');
      });
    });

    it('should clear all filters', () => {
      modelsPage
        .visit()
        .waitForLoad()
        .filterByType('chat')
        .filterByStatus('enabled')
        .clearFilters();

      // Verify all models are shown again
      cy.get('[data-testid="model-card"]').should('have.length.at.least', 1);
    });
  });

  describe('Model Actions', () => {
    it('should view model details', () => {
      modelsPage
        .visit()
        .waitForLoad();

      // Get the first model name
      cy.get('[data-testid="model-card"]').first().find('[data-testid="model-name"]').invoke('text').then((modelName) => {
        modelsPage.viewModel(modelName.trim());
        
        // Verify we're on the view page
        cy.url().should('include', '/ai/models/');
        cy.url().should('include', '/show');
      });
    });

    it('should edit model', () => {
      modelsPage
        .visit()
        .waitForLoad();

      // Get the first model name
      cy.get('[data-testid="model-card"]').first().find('[data-testid="model-name"]').invoke('text').then((modelName) => {
        modelsPage.editModel(modelName.trim());
        
        // Verify we're on the edit page
        cy.url().should('include', '/ai/models/');
        cy.url().should('include', '/edit');
        
        // Verify form is pre-filled
        cy.get('[name="name"]').should('have.value', modelName.trim());
      });
    });

    it('should set model as default', () => {
      modelsPage
        .visit()
        .waitForLoad();

      // Find a non-default model and set it as default
      cy.get('[data-testid="model-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="model-status"]').then(($status) => {
          if (!$status.text().includes('Default')) {
            cy.wrap($card).find('[data-testid="model-name"]').invoke('text').then((modelName) => {
              cy.intercept('POST', `/ai/models/*/set-default`).as('setDefault');
              modelsPage.setAsDefault(modelName.trim());
              
              cy.wait('@setDefault');
              cy.checkToast('success', 'Model set as default');
            });
            return false; // Exit the loop
          }
        });
      });
    });

    it('should toggle model status', () => {
      modelsPage
        .visit()
        .waitForLoad();

      // Get the first model and toggle its status
      cy.get('[data-testid="model-card"]').first().find('[data-testid="model-name"]').invoke('text').then((modelName) => {
        cy.intercept('POST', `/ai/models/*/toggle-status`).as('toggleStatus');
        modelsPage.toggleStatus(modelName.trim());
        
        cy.wait('@toggleStatus');
        cy.checkToast('success');
      });
    });

    it('should delete model with confirmation', () => {
      // First create a test model to delete
      cy.request({
        method: 'POST',
        url: '/ai/models',
        body: {
          ...testModelData,
          name: 'Model to Delete',
          slug: 'model-to-delete'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(() => {
        modelsPage
          .visit()
          .waitForLoad();

        cy.intercept('DELETE', `/ai/models/*`).as('deleteModel');
        modelsPage.deleteModel('Model to Delete');
        
        cy.wait('@deleteModel');
        cy.checkToast('success', 'Model deleted successfully');
        
        // Verify model is removed from list
        cy.get('[data-testid="model-card"]').should('not.contain', 'Model to Delete');
      });
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', () => {
      modelsPage
        .visit()
        .waitForLoad();

      // Check if pagination is present (only if there are enough models)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination-container"]').length > 0) {
          // Test pagination
          cy.get('[data-testid="page-info"]').should('be.visible');
          
          // Try to go to next page if available
          cy.get('[data-testid="next-page-button"]').then(($btn) => {
            if (!$btn.prop('disabled')) {
              modelsPage.goToNextPage();
              cy.url().should('include', 'page=2');
              
              // Go back to previous page
              modelsPage.goToPrevPage();
              cy.url().should('include', 'page=1');
            }
          });
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667);
      
      modelsPage
        .visit()
        .waitForLoad()
        .verifyPageTitle();

      // Verify mobile layout
      cy.get('[data-testid="model-card"]').should('be.visible');
      cy.get('[data-testid="create-model-button"]').should('be.visible');
    });

    it('should work correctly on tablet devices', () => {
      cy.viewport(768, 1024);
      
      modelsPage
        .visit()
        .waitForLoad()
        .verifyModelsContainer();

      // Verify tablet layout
      cy.get('[data-testid="model-card"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('GET', '/ai/models', { statusCode: 500 }).as('modelsError');
      
      modelsPage.visit();
      
      cy.wait('@modelsError');
      
      // Verify error message is shown
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should handle network errors', () => {
      // Intercept API call and simulate network error
      cy.intercept('GET', '/ai/models', { forceNetworkError: true }).as('networkError');
      
      modelsPage.visit();
      
      // Verify error handling
      cy.get('body').should('be.visible');
    });
  });
});
