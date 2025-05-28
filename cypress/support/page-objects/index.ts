// Export all page objects for easy importing
export { AIDashboardPage } from './ai-dashboard.page';
export { AIModelsPage } from './ai-models.page';

// Additional page objects that we should create
export class AIServicesPage {
  private selectors = {
    pageTitle: '[data-testid="page-title"]',
    loadingSpinner: '[data-testid="loading"]',
    createButton: '[data-testid="create-service-button"]',
    searchInput: '[data-testid="search-input"]',
    servicesContainer: '[data-testid="services-container"]',
    serviceCard: '[data-testid="service-card"]',
    serviceName: '[data-testid="service-name"]',
    serviceProvider: '[data-testid="service-provider"]',
    serviceStatus: '[data-testid="service-status"]',
    serviceActionsButton: '[data-testid="service-actions-button"]',
    viewButton: '[data-testid="view-button"]',
    editButton: '[data-testid="edit-button"]',
    deleteButton: '[data-testid="delete-button"]',
    testConnectionButton: '[data-testid="test-connection-button"]',
    setDefaultButton: '[data-testid="set-default-button"]',
    toggleStatusButton: '[data-testid="toggle-status-button"]',
    form: '[data-testid="service-form"]',
    submitButton: '[data-testid="submit-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    deleteModal: '[data-testid="delete-modal"]',
    confirmDeleteButton: '[data-testid="confirm-delete-button"]',
  };

  visit() {
    cy.visitAIPage('services');
    return this;
  }

  waitForLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.pageTitle).should('be.visible');
    return this;
  }

  verifyPageTitle() {
    cy.get(this.selectors.pageTitle).should('contain', 'AI Services');
    return this;
  }

  clickCreateButton() {
    cy.get(this.selectors.createButton).click();
    return this;
  }

  searchServices(searchTerm: string) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    cy.get(this.selectors.searchInput).type('{enter}');
    return this;
  }

  verifyServiceExists(serviceName: string) {
    cy.get(this.selectors.serviceCard)
      .contains(serviceName)
      .should('be.visible');
    return this;
  }
}

export class AIConversationsPage {
  private selectors = {
    pageTitle: '[data-testid="page-title"]',
    loadingSpinner: '[data-testid="loading"]',
    createButton: '[data-testid="create-conversation-button"]',
    searchInput: '[data-testid="search-input"]',
    conversationsContainer: '[data-testid="conversations-container"]',
    conversationCard: '[data-testid="conversation-card"]',
    conversationTitle: '[data-testid="conversation-title"]',
    conversationContext: '[data-testid="conversation-context"]',
    conversationStatus: '[data-testid="conversation-status"]',
    conversationActionsButton: '[data-testid="conversation-actions-button"]',
    viewButton: '[data-testid="view-button"]',
    archiveButton: '[data-testid="archive-button"]',
    unarchiveButton: '[data-testid="unarchive-button"]',
    deleteButton: '[data-testid="delete-button"]',
    messagesContainer: '[data-testid="messages-container"]',
    messageItem: '[data-testid="message-item"]',
    messageInput: '[data-testid="message-input"]',
    sendMessageButton: '[data-testid="send-message-button"]',
    exportButton: '[data-testid="export-button"]',
    statsContainer: '[data-testid="stats-container"]',
    deleteModal: '[data-testid="delete-modal"]',
    confirmDeleteButton: '[data-testid="confirm-delete-button"]',
  };

  visit() {
    cy.visitAIPage('conversations');
    return this;
  }

  waitForLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.pageTitle).should('be.visible');
    return this;
  }

  verifyPageTitle() {
    cy.get(this.selectors.pageTitle).should('contain', 'AI Conversations');
    return this;
  }

  clickCreateButton() {
    cy.get(this.selectors.createButton).click();
    return this;
  }

  searchConversations(searchTerm: string) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    cy.get(this.selectors.searchInput).type('{enter}');
    return this;
  }

  verifyConversationExists(title: string) {
    cy.get(this.selectors.conversationCard)
      .contains(title)
      .should('be.visible');
    return this;
  }
}

export class AIPromptTemplatesPage {
  private selectors = {
    pageTitle: '[data-testid="page-title"]',
    loadingSpinner: '[data-testid="loading"]',
    createButton: '[data-testid="create-template-button"]',
    searchInput: '[data-testid="search-input"]',
    templatesContainer: '[data-testid="templates-container"]',
    templateCard: '[data-testid="template-card"]',
    templateName: '[data-testid="template-name"]',
    templateCategory: '[data-testid="template-category"]',
    templateStatus: '[data-testid="template-status"]',
    templateActionsButton: '[data-testid="template-actions-button"]',
    viewButton: '[data-testid="view-button"]',
    editButton: '[data-testid="edit-button"]',
    deleteButton: '[data-testid="delete-button"]',
    duplicateButton: '[data-testid="duplicate-button"]',
    renderButton: '[data-testid="render-button"]',
    rateButton: '[data-testid="rate-button"]',
    usageCount: '[data-testid="usage-count"]',
    averageRating: '[data-testid="average-rating"]',
    renderModal: '[data-testid="render-modal"]',
    ratingModal: '[data-testid="rating-modal"]',
    deleteModal: '[data-testid="delete-modal"]',
    confirmDeleteButton: '[data-testid="confirm-delete-button"]',
  };

  visit() {
    cy.visitAIPage('prompt-templates');
    return this;
  }

  waitForLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.pageTitle).should('be.visible');
    return this;
  }

  verifyPageTitle() {
    cy.get(this.selectors.pageTitle).should('contain', 'Prompt Templates');
    return this;
  }

  clickCreateButton() {
    cy.get(this.selectors.createButton).click();
    return this;
  }

  searchTemplates(searchTerm: string) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    cy.get(this.selectors.searchInput).type('{enter}');
    return this;
  }

  verifyTemplateExists(templateName: string) {
    cy.get(this.selectors.templateCard)
      .contains(templateName)
      .should('be.visible');
    return this;
  }
}

// Common utilities for all page objects
export class CommonActions {
  static waitForToast(type: 'success' | 'error' | 'warning' | 'info', message?: string) {
    cy.get('[data-sonner-toaster]').should('be.visible');
    if (message) {
      cy.get('[data-sonner-toaster]').should('contain', message);
    }
  }

  static waitForModal(modalTestId: string) {
    cy.get(`[data-testid="${modalTestId}"]`).should('be.visible');
  }

  static closeModal(modalTestId: string) {
    cy.get(`[data-testid="${modalTestId}"]`).within(() => {
      cy.get('[data-testid="close-button"], .close-button, [aria-label="Close"]').click();
    });
  }

  static confirmAction(confirmButtonTestId: string = 'confirm-button') {
    cy.get(`[data-testid="${confirmButtonTestId}"]`).click();
  }

  static cancelAction(cancelButtonTestId: string = 'cancel-button') {
    cy.get(`[data-testid="${cancelButtonTestId}"]`).click();
  }

  static verifyUrl(expectedPath: string) {
    cy.url().should('include', expectedPath);
  }

  static verifyPageNotFound() {
    cy.get('[data-testid="404"], .not-found').should('be.visible');
  }

  static verifyAccessDenied() {
    cy.get('[data-testid="403"], .access-denied').should('be.visible');
  }
}
