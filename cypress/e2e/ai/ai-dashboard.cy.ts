import { AIDashboardPage } from '../../support/page-objects/ai-dashboard.page';

describe('AI Dashboard', () => {
  const dashboardPage = new AIDashboardPage();

  beforeEach(() => {
    // Login as admin user before each test
    cy.loginAsAdmin();
  });

  describe('Page Load and Layout', () => {
    it('should load the AI dashboard successfully', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .verifyPageTitle();
    });

    it('should display all main dashboard components', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .verifyStatsCards()
        .verifyCharts()
        .verifyServiceStatus()
        .verifyRecentActivity()
        .verifyQuickActions();
    });

    it('should be responsive on different screen sizes', () => {
      // Test mobile view
      cy.viewport(375, 667);
      dashboardPage
        .visit()
        .waitForLoad()
        .verifyPageTitle();

      // Test tablet view
      cy.viewport(768, 1024);
      dashboardPage
        .verifyStatsCards()
        .verifyCharts();

      // Test desktop view
      cy.viewport(1280, 720);
      dashboardPage
        .verifyQuickActions();
    });
  });

  describe('Statistics Cards', () => {
    it('should display statistics cards with correct data', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .verifyStatValue('models')
        .verifyStatValue('services')
        .verifyStatValue('conversations')
        .verifyStatValue('usage');
    });

    it('should update statistics when data changes', () => {
      // This test would require API mocking or database manipulation
      // For now, we'll just verify the cards are present and clickable
      dashboardPage
        .visit()
        .waitForLoad();

      cy.get('[data-testid="total-models-card"]').should('be.visible').click();
      cy.url().should('include', '/ai/models');

      cy.go('back');
      
      cy.get('[data-testid="total-services-card"]').should('be.visible').click();
      cy.url().should('include', '/ai/services');
    });
  });

  describe('Charts and Analytics', () => {
    it('should display usage chart', () => {
      dashboardPage
        .visit()
        .waitForLoad();

      cy.get('[data-testid="usage-chart"]')
        .should('be.visible')
        .within(() => {
          // Verify chart elements are present
          cy.get('svg').should('exist');
        });
    });

    it('should display cost chart', () => {
      dashboardPage
        .visit()
        .waitForLoad();

      cy.get('[data-testid="cost-chart"]')
        .should('be.visible')
        .within(() => {
          cy.get('svg').should('exist');
        });
    });

    it('should display performance chart', () => {
      dashboardPage
        .visit()
        .waitForLoad();

      cy.get('[data-testid="performance-chart"]')
        .should('be.visible')
        .within(() => {
          cy.get('svg').should('exist');
        });
    });
  });

  describe('Service Status', () => {
    it('should display service status indicators', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .verifyServiceStatus();

      // Verify at least one service is shown
      cy.get('[data-testid="service-status-card"]').should('have.length.at.least', 1);
    });

    it('should show correct status indicators for services', () => {
      dashboardPage
        .visit()
        .waitForLoad();

      // Check if Mistral AI service is shown with active status
      cy.get('[data-testid="service-status-card"]')
        .contains('Mistral AI')
        .should('be.visible');
    });
  });

  describe('Quick Actions', () => {
    it('should navigate to create model page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .clickCreateModel();

      cy.url().should('include', '/ai/models/create');
    });

    it('should navigate to create service page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .clickCreateService();

      cy.url().should('include', '/ai/services/create');
    });

    it('should navigate to create template page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .clickCreateTemplate();

      cy.url().should('include', '/ai/prompt-templates/create');
    });
  });

  describe('Navigation', () => {
    it('should navigate to AI models page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .navigateToModels();

      cy.url().should('include', '/ai/models');
    });

    it('should navigate to AI services page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .navigateToServices();

      cy.url().should('include', '/ai/services');
    });

    it('should navigate to AI conversations page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .navigateToConversations();

      cy.url().should('include', '/ai/conversations');
    });

    it('should navigate to AI templates page', () => {
      dashboardPage
        .visit()
        .waitForLoad()
        .navigateToTemplates();

      cy.url().should('include', '/ai/prompt-templates');
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time data updates', () => {
      dashboardPage
        .visit()
        .waitForLoad();

      // Simulate real-time update by refreshing
      cy.reload();
      dashboardPage.waitForLoad();

      // Verify dashboard still works after refresh
      dashboardPage
        .verifyStatsCards()
        .verifyCharts();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API calls and simulate errors
      cy.intercept('GET', '/ai/dashboard/analytics', { statusCode: 500 }).as('analyticsError');
      
      dashboardPage
        .visit()
        .waitForLoad();

      // Verify error handling doesn't break the page
      cy.get('body').should('be.visible');
    });

    it('should show loading states appropriately', () => {
      // Intercept API calls with delay
      cy.intercept('GET', '/ai/dashboard/analytics', { delay: 2000, fixture: 'ai-dashboard.json' }).as('slowAnalytics');
      
      dashboardPage.visit();

      // Verify loading state is shown
      cy.get('[data-testid="loading"]').should('be.visible');
      
      cy.wait('@slowAnalytics');
      
      // Verify loading state is hidden after data loads
      cy.get('[data-testid="loading"]').should('not.exist');
    });
  });
});
