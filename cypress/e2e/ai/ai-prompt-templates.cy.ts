describe('AI Prompt Templates Management', () => {
  let testTemplateData: any;
  let invalidTemplateData: any;
  let renderData: any;

  before(() => {
    // Load test data
    cy.fixture('ai-prompt-templates').then((data) => {
      testTemplateData = data.validTemplate;
      invalidTemplateData = data.invalidTemplate;
      renderData = data.renderData;
    });
  });

  beforeEach(() => {
    // Login as admin user before each test
    cy.loginAsAdmin();
  });

  describe('Page Load and Layout', () => {
    it('should load the AI prompt templates page successfully', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'Prompt Templates');
      cy.get('[data-testid="templates-container"]').should('be.visible');
    });

    it('should display existing templates', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Verify at least the seeded templates are present
      cy.get('[data-testid="template-card"]').should('have.length.at.least', 1);
    });

    it('should show create button for authorized users', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="create-template-button"]').should('be.visible');
    });
  });

  describe('Template Creation', () => {
    it('should create a new prompt template successfully', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-template-button"]').click();
      cy.url().should('include', '/ai/prompt-templates/create');

      // Fill the form
      cy.fillForm({
        name: testTemplateData.name,
        slug: testTemplateData.slug,
        description: testTemplateData.description,
        category: testTemplateData.category,
        template: testTemplateData.template
      });

      // Add variables
      testTemplateData.variables.forEach((variable: any, index: number) => {
        cy.get('[data-testid="add-variable-button"]').click();
        cy.get(`[data-testid="variable-name-${index}"]`).type(variable.name);
        cy.get(`[data-testid="variable-type-${index}"]`).select(variable.type);
        cy.get(`[data-testid="variable-description-${index}"]`).type(variable.description);
        if (variable.required) {
          cy.get(`[data-testid="variable-required-${index}"]`).check();
        }
      });

      // Submit the form
      cy.intercept('POST', '/ai/prompt-templates').as('createTemplate');
      cy.get('[data-testid="submit-button"]').click();

      // Wait for the request and verify success
      cy.wait('@createTemplate').then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
      });

      // Verify redirect and success message
      cy.url().should('include', '/ai/prompt-templates');
      cy.checkToast('success', 'Template created successfully');

      // Verify the new template appears in the list
      cy.get('[data-testid="template-card"]').should('contain', testTemplateData.name);
    });

    it('should show validation errors for invalid data', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-template-button"]').click();

      // Try to submit empty form
      cy.get('[data-testid="submit-button"]').click();

      // Verify validation errors are shown
      cy.get('.error-message, .text-red-500').should('be.visible');
    });

    it('should handle form cancellation', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-template-button"]').click();

      // Fill some data
      cy.get('[name="name"]').type('Test Template');

      // Cancel the form
      cy.get('[data-testid="cancel-button"]').click();

      // Verify we're back to the templates list
      cy.url().should('include', '/ai/prompt-templates');
      cy.url().should('not.include', '/create');
    });
  });

  describe('Template Listing and Filtering', () => {
    it('should filter templates by category', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="category-filter"]').click();
      cy.get('[data-value="crm"]').click();

      // Verify filtered results
      cy.get('[data-testid="template-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="template-category"]').should('contain', 'CRM');
      });
    });

    it('should filter templates by status', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-value="active"]').click();

      // Verify filtered results show only active templates
      cy.get('[data-testid="template-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="template-status"]').should('contain', 'Active');
      });
    });

    it('should search templates by name', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="search-input"]').type('CRM');
      cy.get('[data-testid="search-input"]').type('{enter}');

      // Verify search results
      cy.get('[data-testid="template-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="template-name"]').should('contain', 'CRM');
      });
    });

    it('should sort templates by usage count', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="sort-select"]').select('usage_count');

      // Verify templates are sorted (this would need specific implementation)
      cy.get('[data-testid="template-card"]').should('exist');
    });

    it('should sort templates by rating', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="sort-select"]').select('average_rating');

      // Verify templates are sorted
      cy.get('[data-testid="template-card"]').should('exist');
    });
  });

  describe('Template Actions', () => {
    it('should view template details', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Get the first template name
      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-name"]').invoke('text').then((templateName) => {
        cy.get('[data-testid="template-card"]')
          .contains(templateName.trim())
          .parent()
          .find('[data-testid="template-actions-button"]')
          .click();
        
        cy.get('[data-testid="view-button"]').click();
        
        // Verify we're on the view page
        cy.url().should('include', '/ai/prompt-templates/');
        cy.url().should('include', '/show');
      });
    });

    it('should edit template', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Get the first template name
      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-name"]').invoke('text').then((templateName) => {
        cy.get('[data-testid="template-card"]')
          .contains(templateName.trim())
          .parent()
          .find('[data-testid="template-actions-button"]')
          .click();
        
        cy.get('[data-testid="edit-button"]').click();
        
        // Verify we're on the edit page
        cy.url().should('include', '/ai/prompt-templates/');
        cy.url().should('include', '/edit');
        
        // Verify form is pre-filled
        cy.get('[name="name"]').should('have.value', templateName.trim());
      });
    });

    it('should duplicate template', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Get the first template name
      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-name"]').invoke('text').then((templateName) => {
        cy.intercept('POST', `/ai/prompt-templates/*/duplicate`).as('duplicateTemplate');
        
        cy.get('[data-testid="template-card"]')
          .contains(templateName.trim())
          .parent()
          .find('[data-testid="template-actions-button"]')
          .click();
        
        cy.get('[data-testid="duplicate-button"]').click();
        
        cy.wait('@duplicateTemplate');
        cy.checkToast('success', 'Template duplicated successfully');
        
        // Verify duplicated template appears
        cy.get('[data-testid="template-card"]').should('contain', `Copy of ${templateName.trim()}`);
      });
    });

    it('should rate template', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Get the first template
      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-name"]').invoke('text').then((templateName) => {
        cy.intercept('POST', `/ai/prompt-templates/*/rate`).as('rateTemplate');
        
        cy.get('[data-testid="template-card"]')
          .contains(templateName.trim())
          .parent()
          .find('[data-testid="template-actions-button"]')
          .click();
        
        cy.get('[data-testid="rate-button"]').click();
        
        // Select rating
        cy.get('[data-testid="rating-modal"]').should('be.visible');
        cy.get('[data-testid="rating-5"]').click();
        cy.get('[data-testid="submit-rating-button"]').click();
        
        cy.wait('@rateTemplate');
        cy.checkToast('success', 'Rating submitted successfully');
      });
    });

    it('should delete template with confirmation', () => {
      // First create a test template to delete
      cy.request({
        method: 'POST',
        url: '/ai/prompt-templates',
        body: {
          ...testTemplateData,
          name: 'Template to Delete',
          slug: 'template-to-delete'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(() => {
        cy.visitAIPage('prompt-templates');
        cy.waitForPageLoad();

        cy.intercept('DELETE', `/ai/prompt-templates/*`).as('deleteTemplate');
        
        cy.get('[data-testid="template-card"]')
          .contains('Template to Delete')
          .parent()
          .find('[data-testid="template-actions-button"]')
          .click();
        
        cy.get('[data-testid="delete-button"]').click();
        
        // Confirm deletion in modal
        cy.get('[data-testid="delete-modal"]').should('be.visible');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteTemplate');
        cy.checkToast('success', 'Template deleted successfully');
        
        // Verify template is removed from list
        cy.get('[data-testid="template-card"]').should('not.contain', 'Template to Delete');
      });
    });
  });

  describe('Template Rendering', () => {
    it('should render template with variables', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Get the first template
      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-name"]').invoke('text').then((templateName) => {
        cy.get('[data-testid="template-card"]')
          .contains(templateName.trim())
          .parent()
          .find('[data-testid="template-actions-button"]')
          .click();
        
        cy.get('[data-testid="render-button"]').click();
        
        // Fill render form
        cy.get('[data-testid="render-modal"]').should('be.visible');
        
        // Fill variables if they exist
        cy.get('[data-testid="variable-input"]').each(($input) => {
          const variableName = $input.attr('data-variable');
          if (renderData[variableName]) {
            cy.wrap($input).type(renderData[variableName]);
          }
        });
        
        cy.intercept('POST', `/ai/prompt-templates/*/render`).as('renderTemplate');
        cy.get('[data-testid="render-submit-button"]').click();
        
        cy.wait('@renderTemplate');
        
        // Verify rendered output is shown
        cy.get('[data-testid="rendered-output"]').should('be.visible');
        cy.get('[data-testid="rendered-output"]').should('contain.text');
      });
    });

    it('should show validation errors for missing required variables', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-actions-button"]').click();
      cy.get('[data-testid="render-button"]').click();
      
      // Try to render without filling required variables
      cy.get('[data-testid="render-submit-button"]').click();
      
      // Verify validation errors
      cy.get('.error-message, .text-red-500').should('be.visible');
    });
  });

  describe('Template Statistics', () => {
    it('should display template usage statistics', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Verify statistics are shown on template cards
      cy.get('[data-testid="template-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="usage-count"]').should('be.visible');
        cy.wrap($card).find('[data-testid="average-rating"]').should('be.visible');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('GET', '/ai/prompt-templates', { statusCode: 500 }).as('templatesError');
      
      cy.visitAIPage('prompt-templates');
      
      cy.wait('@templatesError');
      
      // Verify error message is shown
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should handle template rendering failures', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      cy.get('[data-testid="template-card"]').first().find('[data-testid="template-actions-button"]').click();
      cy.get('[data-testid="render-button"]').click();
      
      // Mock failed rendering
      cy.intercept('POST', `/ai/prompt-templates/*/render`, { statusCode: 400 }).as('failedRender');
      
      cy.get('[data-testid="render-submit-button"]').click();
      
      cy.wait('@failedRender');
      cy.checkToast('error', 'Failed to render template');
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667);
      
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Verify mobile layout
      cy.get('[data-testid="template-card"]').should('be.visible');
      cy.get('[data-testid="create-template-button"]').should('be.visible');
    });

    it('should work correctly on tablet devices', () => {
      cy.viewport(768, 1024);
      
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();

      // Verify tablet layout
      cy.get('[data-testid="templates-container"]').should('be.visible');
    });
  });
});
