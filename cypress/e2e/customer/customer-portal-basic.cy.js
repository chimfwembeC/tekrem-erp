describe('Customer Portal - Basic Tests', () => {
    describe('Application Accessibility', () => {
        it('should load the login page', () => {
            cy.visit('/login');
            cy.contains('Login').should('be.visible');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('input[name="password"]').should('be.visible');
            cy.get('button[type="submit"]').should('be.visible');
        });

        it('should show validation errors for empty login form', () => {
            cy.visit('/login');
            cy.get('button[type="submit"]').click();
            
            // Check that we're still on login page (validation failed)
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing customer routes without authentication', () => {
            cy.visit('/customer/dashboard');
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing customer profile without authentication', () => {
            cy.visit('/customer/profile');
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing customer projects without authentication', () => {
            cy.visit('/customer/projects');
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing customer finance without authentication', () => {
            cy.visit('/customer/finance');
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing customer support without authentication', () => {
            cy.visit('/customer/support');
            cy.url().should('include', '/login');
        });

        it('should redirect to login when accessing customer communications without authentication', () => {
            cy.visit('/customer/communications');
            cy.url().should('include', '/login');
        });
    });

    describe('Guest Pages Accessibility', () => {
        it('should load the home page', () => {
            cy.visit('/');
            cy.get('body').should('be.visible');
        });

        it('should load the about page', () => {
            cy.visit('/about', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
        });

        it('should load the services page', () => {
            cy.visit('/services', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
        });

        it('should load the contact page', () => {
            cy.visit('/contact', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
        });
    });

    describe('Responsive Design', () => {
        it('should work on mobile viewport', () => {
            cy.viewport('iphone-x');
            cy.visit('/login');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('input[name="password"]').should('be.visible');
        });

        it('should work on tablet viewport', () => {
            cy.viewport('ipad-2');
            cy.visit('/login');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('input[name="password"]').should('be.visible');
        });

        it('should work on desktop viewport', () => {
            cy.viewport(1920, 1080);
            cy.visit('/login');
            cy.get('input[name="email"]').should('be.visible');
            cy.get('input[name="password"]').should('be.visible');
        });
    });

    describe('Form Validation', () => {
        it('should validate email format on login form', () => {
            cy.visit('/login');
            cy.get('input[name="email"]').type('invalid-email');
            cy.get('input[name="password"]').type('password');
            cy.get('button[type="submit"]').click();
            
            // Should stay on login page due to validation
            cy.url().should('include', '/login');
        });

        it('should handle empty email field', () => {
            cy.visit('/login');
            cy.get('input[name="password"]').type('password');
            cy.get('button[type="submit"]').click();
            
            // Should stay on login page due to validation
            cy.url().should('include', '/login');
        });

        it('should handle empty password field', () => {
            cy.visit('/login');
            cy.get('input[name="email"]').type('test@example.com');
            cy.get('button[type="submit"]').click();
            
            // Should stay on login page due to validation
            cy.url().should('include', '/login');
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 errors gracefully', () => {
            cy.visit('/nonexistent-page', { failOnStatusCode: false });
            cy.get('body').should('be.visible');
        });

        it('should handle invalid customer routes', () => {
            cy.visit('/customer/invalid-route', { failOnStatusCode: false });
            cy.url().should('include', '/login');
        });
    });

    describe('Security', () => {
        it('should prevent direct access to admin routes', () => {
            cy.visit('/admin/dashboard', { failOnStatusCode: false });
            cy.url().should('include', '/login');
        });

        it('should prevent direct access to staff dashboard', () => {
            cy.visit('/dashboard', { failOnStatusCode: false });
            cy.url().should('include', '/login');
        });
    });

    describe('Performance', () => {
        it('should load login page within reasonable time', () => {
            const start = Date.now();
            cy.visit('/login').then(() => {
                const loadTime = Date.now() - start;
                expect(loadTime).to.be.lessThan(5000); // 5 seconds max
            });
        });

        it('should have no console errors on login page', () => {
            cy.visit('/login');
            cy.window().then((win) => {
                cy.spy(win.console, 'error').as('consoleError');
            });
            cy.get('@consoleError').should('not.have.been.called');
        });
    });
});
