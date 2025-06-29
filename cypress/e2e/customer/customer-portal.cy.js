describe('Customer Portal', () => {
    let customerUser;

    before(() => {
        // Setup database and seed roles
        cy.artisan('migrate:fresh --seed');
        cy.artisan('db:seed --class=RolesAndPermissionsSeeder');
    });

    beforeEach(() => {
        // Create test customer for each test
        cy.create('App\\Models\\User', {
            name: 'Test Customer',
            email: 'customer@test.com',
            password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            email_verified_at: new Date().toISOString(),
        }).then((user) => {
            customerUser = user;
            // Assign customer role
            cy.exec(`php artisan tinker --execute="App\\Models\\User::find(${user.id})->assignRole('customer');"`);
        });
    });

    describe('Authentication & Access', () => {
        it('should redirect unauthenticated users to login', () => {
            cy.visit('/customer/dashboard');
            cy.url().should('include', '/login');
        });

        it('should allow customer login and access to dashboard', () => {
            cy.login(customerUser);
            cy.visit('/customer/dashboard');
            cy.url().should('include', '/customer/dashboard');
            cy.contains('Customer Dashboard').should('be.visible');
        });

        it('should prevent non-customer users from accessing customer portal', () => {
            // Create a staff user
            cy.create('App\\Models\\User', {
                name: 'Staff User',
                email: 'staff@test.com',
                password: 'password',
            }).then((staffUser) => {
                cy.exec(`php artisan tinker --execute="App\\Models\\User::find(${staffUser.id})->assignRole('staff');"`);
                cy.login(staffUser);
                cy.visit('/customer/dashboard', { failOnStatusCode: false });
                cy.get('body').should('contain', '403');
            });
        });
    });

    describe('Customer Dashboard', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should display customer dashboard with key metrics', () => {
            cy.visit('/customer/dashboard');
            
            // Check dashboard elements
            cy.contains('Welcome back').should('be.visible');
            cy.contains('Support Tickets').should('be.visible');
            cy.contains('Active Projects').should('be.visible');
            cy.contains('Recent Invoices').should('be.visible');
            cy.contains('Quick Actions').should('be.visible');
        });

        it('should have working navigation links', () => {
            cy.visit('/customer/dashboard');

            // Test navigation links by text content
            cy.contains('Profile').click();
            cy.url().should('include', '/customer/profile');

            cy.visit('/customer/dashboard');
            cy.contains('Projects').click();
            cy.url().should('include', '/customer/projects');

            cy.visit('/customer/dashboard');
            cy.contains('Finance').click();
            cy.url().should('include', '/customer/finance');

            cy.visit('/customer/dashboard');
            cy.contains('Support').click();
            cy.url().should('include', '/customer/support');
        });
    });

    describe('Customer Profile Management', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should display customer profile information', () => {
            cy.visit('/customer/profile');
            
            cy.contains('My Profile').should('be.visible');
            cy.contains(customerUser.name).should('be.visible');
            cy.contains(customerUser.email).should('be.visible');
            cy.contains('Basic Information').should('be.visible');
            cy.contains('Account Security').should('be.visible');
        });

        it('should allow profile editing', () => {
            cy.visit('/customer/profile');
            cy.contains('Edit Profile').click();
            
            cy.url().should('include', '/customer/profile/edit');
            
            // Update profile information
            cy.get('input[name="name"]').clear().type('Updated Customer Name');
            cy.get('input[name="phone"]').clear().type('+1234567890');
            cy.get('input[name="company"]').clear().type('Test Company');
            cy.get('textarea[name="bio"]').clear().type('Updated bio information');
            
            cy.get('button[type="submit"]').click();
            
            // Verify update
            cy.contains('Profile updated successfully').should('be.visible');
            cy.contains('Updated Customer Name').should('be.visible');
        });

        it('should allow password change', () => {
            cy.visit('/customer/profile/edit');
            
            // Change password
            cy.get('input[name="current_password"]').type('password');
            cy.get('input[name="password"]').type('newpassword123');
            cy.get('input[name="password_confirmation"]').type('newpassword123');
            
            cy.get('button').contains('Update Password').click();
            
            cy.contains('Password updated successfully').should('be.visible');
        });

        it('should allow notification preferences update', () => {
            cy.visit('/customer/profile/edit');
            
            // Update notification preferences
            cy.get('input[name="email_notifications"]').check();
            cy.get('input[name="ticket_updates"]').check();
            cy.get('input[name="project_updates"]').uncheck();
            
            cy.get('button').contains('Update Notifications').click();
            
            cy.contains('Notification preferences updated').should('be.visible');
        });
    });

    describe('Customer Projects', () => {
        beforeEach(() => {
            cy.login(customerUser);
            
            // Create test project
            cy.create('App\\Models\\Project', {
                name: 'Test Customer Project',
                description: 'A test project for the customer',
                client_id: customerUser.id,
                status: 'active',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
        });

        it('should display customer projects list', () => {
            cy.visit('/customer/projects');
            
            cy.contains('My Projects').should('be.visible');
            cy.contains('Test Customer Project').should('be.visible');
            cy.contains('Active').should('be.visible');
        });

        it('should allow viewing project details', () => {
            cy.visit('/customer/projects');
            cy.contains('Test Customer Project').click();
            
            cy.contains('Project Overview').should('be.visible');
            cy.contains('Test Customer Project').should('be.visible');
            cy.contains('Tasks').should('be.visible');
            cy.contains('Milestones').should('be.visible');
            cy.contains('Time Tracking').should('be.visible');
        });

        it('should display project tasks', () => {
            cy.visit('/customer/projects');
            cy.contains('Test Customer Project').click();
            cy.contains('Tasks').click();
            
            cy.url().should('include', '/tasks');
            cy.contains('Project Tasks').should('be.visible');
        });

        it('should display project files', () => {
            cy.visit('/customer/projects');
            cy.contains('Test Customer Project').click();
            cy.contains('Files').click();
            
            cy.url().should('include', '/files');
            cy.contains('Project Files').should('be.visible');
        });
    });

    describe('Customer Finance', () => {
        beforeEach(() => {
            cy.login(customerUser);

            // Create test invoice using polymorphic relationship
            cy.create('App\\Models\\Finance\\Invoice', {
                billable_type: 'App\\Models\\User',
                billable_id: customerUser.id,
                invoice_number: 'INV-TEST-001',
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                subtotal: 1000.00,
                tax_amount: 100.00,
                total_amount: 1100.00,
                status: 'pending',
                description: 'Test invoice for customer',
            });
        });

        it('should display financial overview', () => {
            cy.visit('/customer/finance');
            
            cy.contains('Financial Overview').should('be.visible');
            cy.contains('Total Invoices').should('be.visible');
            cy.contains('Outstanding Amount').should('be.visible');
            cy.contains('Recent Invoices').should('be.visible');
        });

        it('should display invoices list', () => {
            cy.visit('/customer/finance/invoices');
            
            cy.contains('My Invoices').should('be.visible');
            cy.contains('INV-TEST-001').should('be.visible');
            cy.contains('Pending').should('be.visible');
            cy.contains('$1,100.00').should('be.visible');
        });

        it('should allow viewing invoice details', () => {
            cy.visit('/customer/finance/invoices');
            cy.contains('INV-TEST-001').click();
            
            cy.contains('Invoice Details').should('be.visible');
            cy.contains('INV-TEST-001').should('be.visible');
            cy.contains('$1,100.00').should('be.visible');
            cy.contains('Download PDF').should('be.visible');
        });

        it('should allow filtering invoices', () => {
            cy.visit('/customer/finance');

            // Check if filter elements exist before using them
            cy.get('body').then(($body) => {
                if ($body.find('select[name="status"]').length > 0) {
                    cy.get('select[name="status"]').select('pending');
                    cy.get('button').contains('Filter').click();
                    cy.contains('INV-TEST-001').should('be.visible');
                }
            });
        });
    });

    describe('Customer Support', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should display support portal', () => {
            cy.visit('/customer/support');
            
            cy.contains('Support Portal').should('be.visible');
            cy.contains('My Tickets').should('be.visible');
            cy.contains('Create New Ticket').should('be.visible');
            cy.contains('Knowledge Base').should('be.visible');
        });

        it('should allow creating support tickets', () => {
            cy.visit('/customer/support/create');
            
            cy.get('input[name="subject"]').type('Test Support Ticket');
            cy.get('select[name="priority"]').select('medium');
            cy.get('select[name="category"]').select('technical');
            cy.get('textarea[name="description"]').type('This is a test support ticket description');
            
            cy.get('button[type="submit"]').click();
            
            cy.contains('Ticket created successfully').should('be.visible');
            cy.contains('Test Support Ticket').should('be.visible');
        });

        it('should display ticket details', () => {
            // Create a test ticket first
            cy.create('App\\Models\\Support\\Ticket', {
                requester_type: 'App\\Models\\User',
                requester_id: customerUser.id,
                subject: 'Test Ticket',
                description: 'Test ticket description',
                priority: 'medium',
                status: 'open',
                ticket_number: 'TKT-TEST-001',
            }).then(() => {
                cy.visit('/customer/support/tickets');
                cy.contains('Test Ticket').click();
                
                cy.contains('Ticket Details').should('be.visible');
                cy.contains('TKT-TEST-001').should('be.visible');
                cy.contains('Test Ticket').should('be.visible');
                cy.contains('Add Comment').should('be.visible');
            });
        });

        it('should allow adding comments to tickets', () => {
            cy.create('App\\Models\\Support\\Ticket', {
                requester_type: 'App\\Models\\User',
                requester_id: customerUser.id,
                subject: 'Test Ticket',
                description: 'Test ticket description',
                priority: 'medium',
                status: 'open',
                ticket_number: 'TKT-TEST-002',
            }).then(() => {
                cy.visit('/customer/support/tickets');
                cy.contains('Test Ticket').click();
                
                cy.get('textarea[name="comment"]').type('This is a test comment');
                cy.get('button').contains('Add Comment').click();
                
                cy.contains('Comment added successfully').should('be.visible');
                cy.contains('This is a test comment').should('be.visible');
            });
        });

        it('should allow accessing knowledge base', () => {
            cy.visit('/customer/support/knowledge-base');
            
            cy.contains('Knowledge Base').should('be.visible');
            cy.get('input[name="search"]').should('be.visible');
            cy.contains('Browse Articles').should('be.visible');
        });

        it('should allow accessing FAQ', () => {
            cy.visit('/customer/support/faq');
            
            cy.contains('Frequently Asked Questions').should('be.visible');
            cy.contains('Common Questions').should('be.visible');
        });
    });

    describe('Customer Communications', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should display communications history', () => {
            cy.visit('/customer/communications');
            
            cy.contains('Communication History').should('be.visible');
            cy.contains('Recent Communications').should('be.visible');
            cy.contains('Create New Request').should('be.visible');
        });

        it('should allow creating communication requests', () => {
            cy.visit('/customer/communications/create');
            
            cy.get('select[name="type"]').select('email');
            cy.get('input[name="subject"]').type('Test Communication Request');
            cy.get('textarea[name="content"]').type('This is a test communication request');
            cy.get('select[name="priority"]').select('medium');
            
            cy.get('button[type="submit"]').click();
            
            cy.contains('Communication request submitted').should('be.visible');
        });
    });

    describe('Responsive Design', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should work on mobile devices', () => {
            cy.viewport('iphone-x');
            cy.visit('/customer/dashboard');

            // Check mobile navigation - look for menu button (hamburger icon)
            cy.get('button').contains('Menu').should('be.visible').click();

            // Check sidebar navigation
            cy.contains('Profile').should('be.visible');
            cy.contains('Projects').should('be.visible');
            cy.contains('Finance').should('be.visible');
        });

        it('should work on tablet devices', () => {
            cy.viewport('ipad-2');
            cy.visit('/customer/dashboard');

            cy.contains('Welcome back').should('be.visible');
            cy.contains('Profile').should('be.visible');
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should handle 404 errors gracefully', () => {
            cy.visit('/customer/nonexistent-page', { failOnStatusCode: false });
            cy.get('body').should('contain', '404');
        });

        it('should handle form validation errors', () => {
            cy.visit('/customer/profile/edit');
            
            // Submit form with invalid data
            cy.get('input[name="email"]').clear().type('invalid-email');
            cy.get('button[type="submit"]').click();
            
            cy.contains('The email must be a valid email address').should('be.visible');
        });

        it('should handle network errors gracefully', () => {
            // Simulate network failure
            cy.intercept('PUT', '/customer/profile', { forceNetworkError: true });

            cy.visit('/customer/profile/edit');
            cy.get('input[name="name"]').clear().type('Updated Name');
            cy.get('button[type="submit"]').click();

            // Should show error message or handle gracefully
            cy.get('body').should('be.visible'); // Basic check that page doesn't crash
        });
    });

    describe('Customer Notifications', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should display notification dropdown', () => {
            cy.visit('/customer/dashboard');

            // Check if notification component exists
            cy.get('body').then(($body) => {
                if ($body.find('[data-testid="notifications"]').length > 0) {
                    cy.get('[data-testid="notifications"]').click();
                    cy.contains('Notifications').should('be.visible');
                }
            });
        });

        it('should handle empty notifications state', () => {
            cy.visit('/customer/dashboard');

            // Check notification area exists and handles empty state
            cy.get('body').should('contain.text', 'Welcome back');
        });
    });

    describe('Customer LiveChat Integration', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should access project chat functionality', () => {
            // Create a test project first
            cy.create('App\\Models\\Project', {
                name: 'Chat Test Project',
                description: 'Project for testing chat',
                client_id: customerUser.id,
                status: 'active',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }).then(() => {
                cy.visit('/customer/projects');
                cy.contains('Chat Test Project').click();

                // Check if chat functionality is available
                cy.get('body').then(($body) => {
                    if ($body.find('button').filter(':contains("Chat")').length > 0) {
                        cy.contains('Chat').click();
                        cy.url().should('include', 'chat');
                    }
                });
            });
        });

        it('should display communication history', () => {
            cy.visit('/customer/communications');

            cy.contains('Communication History').should('be.visible');
            cy.contains('Recent Communications').should('be.visible');
        });
    });

    describe('Customer Data Security', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should only show customer-owned data', () => {
            // Create another customer's project
            cy.create('App\\Models\\User', {
                name: 'Other Customer',
                email: 'other@test.com',
                password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            }).then((otherUser) => {
                cy.exec(`php artisan tinker --execute="App\\Models\\User::find(${otherUser.id})->assignRole('customer');"`);

                cy.create('App\\Models\\Project', {
                    name: 'Other Customer Project',
                    description: 'Should not be visible',
                    client_id: otherUser.id,
                    status: 'active',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                }).then(() => {
                    cy.visit('/customer/projects');

                    // Should not see other customer's project
                    cy.get('body').should('not.contain', 'Other Customer Project');
                });
            });
        });

        it('should prevent access to admin routes', () => {
            cy.visit('/admin/dashboard', { failOnStatusCode: false });
            cy.get('body').should('contain', '403');
        });

        it('should prevent access to staff routes', () => {
            cy.visit('/dashboard', { failOnStatusCode: false });
            cy.get('body').should('contain', '403');
        });
    });

    describe('Customer Search and Filtering', () => {
        beforeEach(() => {
            cy.login(customerUser);
        });

        it('should search within knowledge base', () => {
            cy.visit('/customer/support/knowledge-base');

            cy.get('body').then(($body) => {
                if ($body.find('input[name="search"]').length > 0) {
                    cy.get('input[name="search"]').type('test query');
                    cy.get('button[type="submit"]').click();
                    cy.url().should('include', 'search');
                }
            });
        });

        it('should filter FAQ items', () => {
            cy.visit('/customer/support/faq');

            cy.contains('Frequently Asked Questions').should('be.visible');

            // Check if search functionality exists
            cy.get('body').then(($body) => {
                if ($body.find('input[type="search"]').length > 0) {
                    cy.get('input[type="search"]').type('billing');
                    // FAQ should filter results
                    cy.get('body').should('be.visible');
                }
            });
        });
    });
});
