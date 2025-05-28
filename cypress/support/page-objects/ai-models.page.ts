export class AIModelsPage {
  // Selectors
  private selectors = {
    // Page elements
    pageTitle: '[data-testid="page-title"]',
    loadingSpinner: '[data-testid="loading"]',
    
    // Header actions
    createButton: '[data-testid="create-model-button"]',
    searchInput: '[data-testid="search-input"]',
    filterButton: '[data-testid="filter-button"]',
    
    // Filters
    serviceFilter: '[data-testid="service-filter"]',
    typeFilter: '[data-testid="type-filter"]',
    statusFilter: '[data-testid="status-filter"]',
    clearFiltersButton: '[data-testid="clear-filters-button"]',
    
    // Models list
    modelsContainer: '[data-testid="models-container"]',
    modelCard: '[data-testid="model-card"]',
    modelName: '[data-testid="model-name"]',
    modelType: '[data-testid="model-type"]',
    modelStatus: '[data-testid="model-status"]',
    modelService: '[data-testid="model-service"]',
    
    // Model actions
    modelActionsButton: '[data-testid="model-actions-button"]',
    viewButton: '[data-testid="view-button"]',
    editButton: '[data-testid="edit-button"]',
    deleteButton: '[data-testid="delete-button"]',
    setDefaultButton: '[data-testid="set-default-button"]',
    toggleStatusButton: '[data-testid="toggle-status-button"]',
    
    // Pagination
    paginationContainer: '[data-testid="pagination-container"]',
    prevPageButton: '[data-testid="prev-page-button"]',
    nextPageButton: '[data-testid="next-page-button"]',
    pageInfo: '[data-testid="page-info"]',
    
    // Form elements (for create/edit)
    form: '[data-testid="model-form"]',
    nameInput: '[name="name"]',
    slugInput: '[name="slug"]',
    modelIdentifierInput: '[name="model_identifier"]',
    typeSelect: '[name="type"]',
    descriptionTextarea: '[name="description"]',
    maxTokensInput: '[name="max_tokens"]',
    temperatureInput: '[name="temperature"]',
    costPerInputTokenInput: '[name="cost_per_input_token"]',
    costPerOutputTokenInput: '[name="cost_per_output_token"]',
    serviceSelect: '[name="ai_service_id"]',
    submitButton: '[data-testid="submit-button"]',
    cancelButton: '[data-testid="cancel-button"]',
    
    // Modals
    deleteModal: '[data-testid="delete-modal"]',
    confirmDeleteButton: '[data-testid="confirm-delete-button"]',
    cancelDeleteButton: '[data-testid="cancel-delete-button"]',
  };

  // Navigation methods
  visit() {
    cy.visitAIPage('models');
    return this;
  }

  waitForLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.pageTitle).should('be.visible');
    return this;
  }

  // Verification methods
  verifyPageTitle() {
    cy.get(this.selectors.pageTitle).should('contain', 'AI Models');
    return this;
  }

  verifyModelsContainer() {
    cy.get(this.selectors.modelsContainer).should('be.visible');
    return this;
  }

  verifyModelExists(modelName: string) {
    cy.get(this.selectors.modelCard)
      .contains(modelName)
      .should('be.visible');
    return this;
  }

  verifyModelCount(expectedCount: number) {
    cy.get(this.selectors.modelCard).should('have.length', expectedCount);
    return this;
  }

  // Action methods
  clickCreateButton() {
    cy.get(this.selectors.createButton).click();
    return this;
  }

  searchModels(searchTerm: string) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    cy.get(this.selectors.searchInput).type('{enter}');
    return this;
  }

  filterByService(serviceName: string) {
    cy.get(this.selectors.serviceFilter).click();
    cy.get(`[data-value="${serviceName}"]`).click();
    return this;
  }

  filterByType(type: string) {
    cy.get(this.selectors.typeFilter).click();
    cy.get(`[data-value="${type}"]`).click();
    return this;
  }

  filterByStatus(status: string) {
    cy.get(this.selectors.statusFilter).click();
    cy.get(`[data-value="${status}"]`).click();
    return this;
  }

  clearFilters() {
    cy.get(this.selectors.clearFiltersButton).click();
    return this;
  }

  // Model actions
  openModelActions(modelName: string) {
    cy.get(this.selectors.modelCard)
      .contains(modelName)
      .parent()
      .find(this.selectors.modelActionsButton)
      .click();
    return this;
  }

  viewModel(modelName: string) {
    this.openModelActions(modelName);
    cy.get(this.selectors.viewButton).click();
    return this;
  }

  editModel(modelName: string) {
    this.openModelActions(modelName);
    cy.get(this.selectors.editButton).click();
    return this;
  }

  deleteModel(modelName: string) {
    this.openModelActions(modelName);
    cy.get(this.selectors.deleteButton).click();
    cy.get(this.selectors.deleteModal).should('be.visible');
    cy.get(this.selectors.confirmDeleteButton).click();
    return this;
  }

  setAsDefault(modelName: string) {
    this.openModelActions(modelName);
    cy.get(this.selectors.setDefaultButton).click();
    return this;
  }

  toggleStatus(modelName: string) {
    this.openModelActions(modelName);
    cy.get(this.selectors.toggleStatusButton).click();
    return this;
  }

  // Form methods
  fillModelForm(modelData: any) {
    if (modelData.name) {
      cy.get(this.selectors.nameInput).clear().type(modelData.name);
    }
    if (modelData.slug) {
      cy.get(this.selectors.slugInput).clear().type(modelData.slug);
    }
    if (modelData.model_identifier) {
      cy.get(this.selectors.modelIdentifierInput).clear().type(modelData.model_identifier);
    }
    if (modelData.type) {
      cy.get(this.selectors.typeSelect).select(modelData.type);
    }
    if (modelData.description) {
      cy.get(this.selectors.descriptionTextarea).clear().type(modelData.description);
    }
    if (modelData.max_tokens) {
      cy.get(this.selectors.maxTokensInput).clear().type(modelData.max_tokens.toString());
    }
    if (modelData.temperature) {
      cy.get(this.selectors.temperatureInput).clear().type(modelData.temperature.toString());
    }
    if (modelData.cost_per_input_token) {
      cy.get(this.selectors.costPerInputTokenInput).clear().type(modelData.cost_per_input_token.toString());
    }
    if (modelData.cost_per_output_token) {
      cy.get(this.selectors.costPerOutputTokenInput).clear().type(modelData.cost_per_output_token.toString());
    }
    return this;
  }

  submitForm() {
    cy.get(this.selectors.submitButton).click();
    return this;
  }

  cancelForm() {
    cy.get(this.selectors.cancelButton).click();
    return this;
  }

  // Pagination methods
  goToNextPage() {
    cy.get(this.selectors.nextPageButton).click();
    return this;
  }

  goToPrevPage() {
    cy.get(this.selectors.prevPageButton).click();
    return this;
  }

  verifyPageInfo(expectedText: string) {
    cy.get(this.selectors.pageInfo).should('contain', expectedText);
    return this;
  }
}
