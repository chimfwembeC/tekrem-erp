export class AIDashboardPage {
  // Selectors
  private selectors = {
    // Page elements
    pageTitle: '[data-testid="page-title"]',
    loadingSpinner: '[data-testid="loading"]',
    
    // Statistics cards
    statsContainer: '[data-testid="stats-container"]',
    totalModelsCard: '[data-testid="total-models-card"]',
    totalServicesCard: '[data-testid="total-services-card"]',
    totalConversationsCard: '[data-testid="total-conversations-card"]',
    totalUsageCard: '[data-testid="total-usage-card"]',
    
    // Charts and analytics
    usageChart: '[data-testid="usage-chart"]',
    costChart: '[data-testid="cost-chart"]',
    performanceChart: '[data-testid="performance-chart"]',
    
    // Service status
    serviceStatusContainer: '[data-testid="service-status-container"]',
    serviceStatusCard: '[data-testid="service-status-card"]',
    serviceStatusIndicator: '[data-testid="service-status-indicator"]',
    
    // Recent activity
    recentActivityContainer: '[data-testid="recent-activity-container"]',
    recentActivityItem: '[data-testid="recent-activity-item"]',
    
    // Quick actions
    quickActionsContainer: '[data-testid="quick-actions-container"]',
    createModelButton: '[data-testid="create-model-button"]',
    createServiceButton: '[data-testid="create-service-button"]',
    createTemplateButton: '[data-testid="create-template-button"]',
    
    // Navigation
    modelsLink: '[data-testid="models-nav-link"]',
    servicesLink: '[data-testid="services-nav-link"]',
    conversationsLink: '[data-testid="conversations-nav-link"]',
    templatesLink: '[data-testid="templates-nav-link"]',
  };

  // Navigation methods
  visit() {
    cy.visitAIPage('dashboard');
    return this;
  }

  waitForLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.pageTitle).should('be.visible');
    return this;
  }

  // Verification methods
  verifyPageTitle() {
    cy.get(this.selectors.pageTitle).should('contain', 'AI Dashboard');
    return this;
  }

  verifyStatsCards() {
    cy.get(this.selectors.statsContainer).should('be.visible');
    cy.get(this.selectors.totalModelsCard).should('be.visible');
    cy.get(this.selectors.totalServicesCard).should('be.visible');
    cy.get(this.selectors.totalConversationsCard).should('be.visible');
    cy.get(this.selectors.totalUsageCard).should('be.visible');
    return this;
  }

  verifyCharts() {
    cy.get(this.selectors.usageChart).should('be.visible');
    cy.get(this.selectors.costChart).should('be.visible');
    cy.get(this.selectors.performanceChart).should('be.visible');
    return this;
  }

  verifyServiceStatus() {
    cy.get(this.selectors.serviceStatusContainer).should('be.visible');
    cy.get(this.selectors.serviceStatusCard).should('exist');
    return this;
  }

  verifyRecentActivity() {
    cy.get(this.selectors.recentActivityContainer).should('be.visible');
    return this;
  }

  verifyQuickActions() {
    cy.get(this.selectors.quickActionsContainer).should('be.visible');
    cy.get(this.selectors.createModelButton).should('be.visible');
    cy.get(this.selectors.createServiceButton).should('be.visible');
    cy.get(this.selectors.createTemplateButton).should('be.visible');
    return this;
  }

  // Action methods
  clickCreateModel() {
    cy.get(this.selectors.createModelButton).click();
    return this;
  }

  clickCreateService() {
    cy.get(this.selectors.createServiceButton).click();
    return this;
  }

  clickCreateTemplate() {
    cy.get(this.selectors.createTemplateButton).click();
    return this;
  }

  navigateToModels() {
    cy.get(this.selectors.modelsLink).click();
    return this;
  }

  navigateToServices() {
    cy.get(this.selectors.servicesLink).click();
    return this;
  }

  navigateToConversations() {
    cy.get(this.selectors.conversationsLink).click();
    return this;
  }

  navigateToTemplates() {
    cy.get(this.selectors.templatesLink).click();
    return this;
  }

  // Data verification methods
  verifyStatValue(statType: 'models' | 'services' | 'conversations' | 'usage', expectedValue?: string) {
    const cardSelector = this.selectors[`total${statType.charAt(0).toUpperCase() + statType.slice(1)}Card`];
    cy.get(cardSelector).should('be.visible');
    if (expectedValue) {
      cy.get(cardSelector).should('contain', expectedValue);
    }
    return this;
  }

  verifyServiceStatusIndicator(serviceName: string, status: 'active' | 'inactive' | 'error') {
    cy.get(this.selectors.serviceStatusCard)
      .contains(serviceName)
      .parent()
      .find(this.selectors.serviceStatusIndicator)
      .should('have.class', `status-${status}`);
    return this;
  }

  verifyRecentActivityItem(activityText: string) {
    cy.get(this.selectors.recentActivityItem).should('contain', activityText);
    return this;
  }
}
