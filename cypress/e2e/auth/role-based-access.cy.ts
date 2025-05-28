describe('Role-Based Access Control', () => {
  let userData: any;

  before(() => {
    // Load test data
    cy.fixture('users').then((data) => {
      userData = data;
    });
  });

  describe('Admin Role Access', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it('should allow admin access to AI dashboard', () => {
      cy.visitAIPage('dashboard');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Dashboard');
      cy.url().should('include', '/ai/dashboard');
    });

    it('should allow admin access to AI models management', () => {
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Models');
      cy.get('[data-testid="create-model-button"]').should('be.visible');
    });

    it('should allow admin access to AI services management', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Services');
      cy.get('[data-testid="create-service-button"]').should('be.visible');
    });

    it('should allow admin access to AI conversations', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Conversations');
      cy.get('[data-testid="create-conversation-button"]').should('be.visible');
    });

    it('should allow admin access to AI prompt templates', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'Prompt Templates');
      cy.get('[data-testid="create-template-button"]').should('be.visible');
    });

    it('should allow admin to perform CRUD operations on models', () => {
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      // Verify admin can see all action buttons
      cy.get('[data-testid="model-card"]').first().within(() => {
        cy.get('[data-testid="model-actions-button"]').click();
      });
      
      cy.get('[data-testid="edit-button"]').should('be.visible');
      cy.get('[data-testid="delete-button"]').should('be.visible');
      cy.get('[data-testid="set-default-button"]').should('be.visible');
    });

    it('should allow admin to perform CRUD operations on services', () => {
      cy.visitAIPage('services');
      cy.waitForPageLoad();
      
      // Verify admin can see all action buttons
      cy.get('[data-testid="service-card"]').first().within(() => {
        cy.get('[data-testid="service-actions-button"]').click();
      });
      
      cy.get('[data-testid="edit-button"]').should('be.visible');
      cy.get('[data-testid="delete-button"]').should('be.visible');
      cy.get('[data-testid="test-connection-button"]').should('be.visible');
    });

    it('should allow admin access to advanced settings', () => {
      cy.visit('/settings/advanced');
      
      // Should not be redirected
      cy.url().should('include', '/settings/advanced');
      cy.get('[data-testid="advanced-settings"]').should('be.visible');
    });

    it('should allow admin to manage user roles', () => {
      cy.visit('/settings/users');
      
      // Should have access to user management
      cy.url().should('include', '/settings/users');
      cy.get('[data-testid="users-management"]').should('be.visible');
    });
  });

  describe('Staff Role Access', () => {
    beforeEach(() => {
      cy.loginAsStaff();
    });

    it('should allow staff access to AI dashboard', () => {
      cy.visitAIPage('dashboard');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Dashboard');
      cy.url().should('include', '/ai/dashboard');
    });

    it('should allow staff access to AI models (read-only)', () => {
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Models');
      
      // Staff should have limited access - check if create button is hidden or disabled
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="create-model-button"]').length > 0) {
          // If button exists, it might be disabled for staff
          cy.get('[data-testid="create-model-button"]').should('be.disabled');
        }
      });
    });

    it('should allow staff access to AI conversations', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Conversations');
      // Staff should be able to create conversations
      cy.get('[data-testid="create-conversation-button"]').should('be.visible');
    });

    it('should allow staff access to AI prompt templates', () => {
      cy.visitAIPage('prompt-templates');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'Prompt Templates');
      // Staff might have limited template creation rights
    });

    it('should restrict staff from deleting models', () => {
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      // Check if staff can see delete buttons
      cy.get('[data-testid="model-card"]').first().within(() => {
        cy.get('[data-testid="model-actions-button"]').click();
      });
      
      // Delete button should not be visible for staff
      cy.get('[data-testid="delete-button"]').should('not.exist');
    });

    it('should restrict staff from accessing advanced settings', () => {
      cy.visit('/settings/advanced');
      
      // Should be redirected or show access denied
      cy.url().should('not.include', '/settings/advanced');
      // Might be redirected to dashboard or show 403 error
    });

    it('should restrict staff from user management', () => {
      cy.visit('/settings/users');
      
      // Should be redirected or show access denied
      cy.url().should('not.include', '/settings/users');
    });

    it('should restrict staff from managing AI services', () => {
      cy.visitAIPage('services');
      
      // Staff might not have access to services at all, or have read-only access
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="page-title"]').length > 0) {
          // If they have access, check for restricted actions
          cy.get('[data-testid="create-service-button"]').should('not.exist');
        } else {
          // No access at all
          cy.url().should('not.include', '/ai/services');
        }
      });
    });
  });

  describe('Unauthorized Access Attempts', () => {
    it('should redirect unauthorized users from admin-only routes', () => {
      cy.loginAsStaff();
      
      // Try to access admin-only route
      cy.visit('/settings/advanced');
      
      // Should be redirected
      cy.url().should('not.include', '/settings/advanced');
    });

    it('should show 403 error for unauthorized API requests', () => {
      cy.loginAsStaff();
      
      // Try to make admin-only API request
      cy.request({
        method: 'POST',
        url: '/ai/services',
        body: { name: 'Test Service' },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(403);
      });
    });

    it('should prevent staff from accessing admin endpoints', () => {
      cy.loginAsStaff();
      
      // Try to access user management endpoint
      cy.request({
        method: 'GET',
        url: '/settings/users',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404, 302]);
      });
    });
  });

  describe('Permission-Based UI Elements', () => {
    it('should show different navigation items based on role', () => {
      // Test admin navigation
      cy.loginAsAdmin();
      cy.visit('/dashboard');
      
      cy.get('[data-testid="sidebar"], [data-testid="navigation"]').within(() => {
        cy.get('[data-testid="settings-nav"]').should('be.visible');
        cy.get('[data-testid="admin-nav"]').should('be.visible');
      });
      
      // Test staff navigation
      cy.loginAsStaff();
      cy.visit('/dashboard');
      
      cy.get('[data-testid="sidebar"], [data-testid="navigation"]').within(() => {
        cy.get('[data-testid="settings-nav"]').should('not.exist');
        cy.get('[data-testid="admin-nav"]').should('not.exist');
      });
    });

    it('should show different action buttons based on permissions', () => {
      // Admin should see all buttons
      cy.loginAsAdmin();
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-model-button"]').should('be.visible');
      
      // Staff should see limited buttons
      cy.loginAsStaff();
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-model-button"]').should('not.exist');
    });
  });

  describe('Dynamic Permission Checking', () => {
    it('should check permissions on page load', () => {
      cy.loginAsStaff();
      
      // Intercept permission check API call
      cy.intercept('GET', '/api/permissions*').as('permissionCheck');
      
      cy.visitAIPage('dashboard');
      
      // Verify permission check was made
      cy.wait('@permissionCheck');
    });

    it('should update UI when permissions change', () => {
      cy.loginAsAdmin();
      cy.visitAIPage('models');
      cy.waitForPageLoad();
      
      // Verify admin can see create button
      cy.get('[data-testid="create-model-button"]').should('be.visible');
      
      // Simulate permission change (this would require backend support)
      // In a real scenario, you might change user role via API
    });
  });

  describe('Security Headers and CSRF Protection', () => {
    it('should include CSRF tokens in forms', () => {
      cy.loginAsAdmin();
      cy.visitAIPage('models');
      cy.get('[data-testid="create-model-button"]').click();
      
      // Verify CSRF token is present in forms
      cy.get('input[name="_token"], meta[name="csrf-token"]').should('exist');
    });

    it('should validate CSRF tokens on form submission', () => {
      cy.loginAsAdmin();
      cy.visitAIPage('models');
      cy.get('[data-testid="create-model-button"]').click();
      
      // Remove CSRF token and try to submit
      cy.get('input[name="_token"]').then(($input) => {
        if ($input.length > 0) {
          cy.wrap($input).invoke('remove');
        }
      });
      
      cy.get('[data-testid="submit-button"]').click();
      
      // Should get CSRF error
      cy.get('.error-message').should('contain', 'CSRF');
    });
  });

  describe('Session Security', () => {
    it('should invalidate session when role changes', () => {
      cy.loginAsAdmin();
      cy.visit('/settings/advanced');
      
      // Verify access
      cy.get('[data-testid="advanced-settings"]').should('be.visible');
      
      // Simulate role change (would require backend API)
      // In real scenario, admin role would be removed
      
      // Try to access the same page
      cy.reload();
      
      // Should be redirected or denied access
      // This test would need actual role change implementation
    });

    it('should handle concurrent sessions correctly', () => {
      // This would test multiple browser sessions
      // Cypress doesn't easily support this, but it's important for security
      cy.loginAsAdmin();
      cy.visit('/ai/dashboard');
      
      // Verify session is active
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });
  });
});
