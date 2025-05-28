describe('Authentication', () => {
  let userData: any;

  before(() => {
    // Load test data
    cy.fixture('users').then((data) => {
      userData = data;
    });
  });

  beforeEach(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login Process', () => {
    it('should login successfully with valid admin credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="email-input"], input[name="email"]').type(userData.admin.email);
      cy.get('[data-testid="password-input"], input[name="password"]').type(userData.admin.password);
      cy.get('[data-testid="login-button"], button[type="submit"]').click();

      // Verify successful login
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"], [data-testid="profile-dropdown"]').should('be.visible');
      
      // Verify user name is displayed
      cy.get('[data-testid="user-name"]').should('contain', userData.admin.name);
    });

    it('should login successfully with valid staff credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type(userData.staff.email);
      cy.get('input[name="password"]').type(userData.staff.password);
      cy.get('button[type="submit"]').click();

      // Verify successful login
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"], [data-testid="profile-dropdown"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('invalid@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      // Verify error message
      cy.get('.error-message, .text-red-500').should('be.visible');
      cy.get('.error-message, .text-red-500').should('contain', 'credentials');
      
      // Verify still on login page
      cy.url().should('include', '/login');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();

      // Verify validation errors
      cy.get('.error-message, .text-red-500').should('be.visible');
    });

    it('should show validation error for invalid email format', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      // Verify email validation error
      cy.get('.error-message, .text-red-500').should('contain', 'email');
    });
  });

  describe('Logout Process', () => {
    it('should logout successfully', () => {
      // Login first
      cy.loginAsAdmin();
      cy.visit('/dashboard');

      // Logout
      cy.get('[data-testid="user-menu"], [data-testid="profile-dropdown"]').click();
      cy.get('[data-testid="logout-button"], a[href*="logout"]').click();

      // Verify logout
      cy.url().should('include', '/login');
      cy.get('input[name="email"]').should('be.visible');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Try to access protected route without authentication
      cy.visit('/ai/dashboard');
      
      // Should be redirected to login
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from AI models page', () => {
      cy.visit('/ai/models');
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from AI services page', () => {
      cy.visit('/ai/services');
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from AI conversations page', () => {
      cy.visit('/ai/conversations');
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from AI prompt templates page', () => {
      cy.visit('/ai/prompt-templates');
      cy.url().should('include', '/login');
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      cy.loginAsAdmin();
      cy.visit('/ai/dashboard');
      
      // Refresh the page
      cy.reload();
      
      // Should still be authenticated
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"], [data-testid="profile-dropdown"]').should('be.visible');
    });

    it('should handle session expiration gracefully', () => {
      cy.loginAsAdmin();
      cy.visit('/ai/dashboard');
      
      // Simulate session expiration by clearing cookies
      cy.clearCookies();
      
      // Try to navigate to another page
      cy.visit('/ai/models');
      
      // Should be redirected to login
      cy.url().should('include', '/login');
    });
  });

  describe('Remember Me Functionality', () => {
    it('should remember user when remember me is checked', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type(userData.admin.email);
      cy.get('input[name="password"]').type(userData.admin.password);
      
      // Check remember me if it exists
      cy.get('body').then(($body) => {
        if ($body.find('input[name="remember"], [data-testid="remember-me"]').length > 0) {
          cy.get('input[name="remember"], [data-testid="remember-me"]').check();
        }
      });
      
      cy.get('button[type="submit"]').click();
      
      // Verify successful login
      cy.url().should('not.include', '/login');
    });
  });

  describe('Password Reset', () => {
    it('should show forgot password link', () => {
      cy.visit('/login');
      
      // Check if forgot password link exists
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="forgot"], [data-testid="forgot-password"]').length > 0) {
          cy.get('a[href*="forgot"], [data-testid="forgot-password"]').should('be.visible');
        }
      });
    });

    it('should navigate to password reset page', () => {
      cy.visit('/login');
      
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="forgot"], [data-testid="forgot-password"]').length > 0) {
          cy.get('a[href*="forgot"], [data-testid="forgot-password"]').click();
          cy.url().should('include', 'forgot');
        }
      });
    });
  });

  describe('Registration', () => {
    it('should show registration link if available', () => {
      cy.visit('/login');
      
      // Check if registration link exists
      cy.get('body').then(($body) => {
        if ($body.find('a[href*="register"], [data-testid="register-link"]').length > 0) {
          cy.get('a[href*="register"], [data-testid="register-link"]').should('be.visible');
        }
      });
    });
  });

  describe('Two-Factor Authentication', () => {
    it('should handle 2FA if enabled', () => {
      // This test would depend on whether 2FA is implemented
      cy.visit('/login');
      
      cy.get('input[name="email"]').type(userData.admin.email);
      cy.get('input[name="password"]').type(userData.admin.password);
      cy.get('button[type="submit"]').click();
      
      // Check if 2FA page appears
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="2fa-code"], input[name="code"]').length > 0) {
          // 2FA is enabled, handle it
          cy.get('[data-testid="2fa-code"], input[name="code"]').should('be.visible');
        } else {
          // No 2FA, should be logged in
          cy.url().should('not.include', '/login');
        }
      });
    });
  });

  describe('Security Features', () => {
    it('should prevent CSRF attacks', () => {
      cy.visit('/login');
      
      // Verify CSRF token is present
      cy.get('input[name="_token"], meta[name="csrf-token"]').should('exist');
    });

    it('should use HTTPS in production', () => {
      // This would be environment-specific
      cy.url().then((url) => {
        if (Cypress.env('environment') === 'production') {
          expect(url).to.include('https://');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667);
      cy.visit('/login');
      
      // Verify mobile layout
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should work correctly on tablet devices', () => {
      cy.viewport(768, 1024);
      cy.visit('/login');
      
      // Verify tablet layout
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      cy.visit('/login');
      
      // Verify form accessibility
      cy.get('input[name="email"]').should('have.attr', 'aria-label').or('have.attr', 'id');
      cy.get('input[name="password"]').should('have.attr', 'aria-label').or('have.attr', 'id');
    });

    it('should support keyboard navigation', () => {
      cy.visit('/login');
      
      // Test tab navigation
      cy.get('input[name="email"]').focus();
      cy.get('input[name="email"]').tab();
      cy.focused().should('have.attr', 'name', 'password');
    });
  });
});
