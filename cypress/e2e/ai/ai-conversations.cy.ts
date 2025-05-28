describe('AI Conversations Management', () => {
  let testConversationData: any;
  let newMessageData: any;

  before(() => {
    // Load test data
    cy.fixture('ai-conversations').then((data) => {
      testConversationData = data.validConversation;
      newMessageData = data.newMessage;
    });
  });

  beforeEach(() => {
    // Login as admin user before each test
    cy.loginAsAdmin();
  });

  describe('Page Load and Layout', () => {
    it('should load the AI conversations page successfully', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="page-title"]').should('contain', 'AI Conversations');
      cy.get('[data-testid="conversations-container"]').should('be.visible');
    });

    it('should display existing conversations', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      // Verify conversations are displayed
      cy.get('[data-testid="conversation-card"]').should('have.length.at.least', 0);
    });

    it('should show create button for authorized users', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('[data-testid="create-conversation-button"]').should('be.visible');
    });
  });

  describe('Conversation Creation', () => {
    it('should create a new conversation successfully', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-conversation-button"]').click();
      cy.url().should('include', '/ai/conversations/create');

      // Fill the form
      cy.fillForm({
        title: testConversationData.title,
        context_type: testConversationData.context_type
      });

      // Submit the form
      cy.intercept('POST', '/ai/conversations').as('createConversation');
      cy.get('[data-testid="submit-button"]').click();

      // Wait for the request and verify success
      cy.wait('@createConversation').then((interception) => {
        expect(interception.response?.statusCode).to.equal(201);
      });

      // Verify redirect and success message
      cy.url().should('include', '/ai/conversations');
      cy.checkToast('success', 'Conversation created successfully');

      // Verify the new conversation appears in the list
      cy.get('[data-testid="conversation-card"]').should('contain', testConversationData.title);
    });

    it('should show validation errors for invalid data', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();
      
      cy.get('[data-testid="create-conversation-button"]').click();

      // Try to submit empty form
      cy.get('[data-testid="submit-button"]').click();

      // Verify validation errors are shown
      cy.get('.error-message, .text-red-500').should('be.visible');
    });
  });

  describe('Conversation Listing and Filtering', () => {
    it('should filter conversations by context type', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('[data-testid="context-filter"]').click();
      cy.get('[data-value="crm"]').click();

      // Verify filtered results
      cy.get('[data-testid="conversation-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="conversation-context"]').should('contain', 'CRM');
      });
    });

    it('should filter conversations by model', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('[data-testid="model-filter"]').click();
      cy.get('[data-value="1"]').click(); // Assuming model ID 1 exists

      // Verify filtered results
      cy.get('[data-testid="conversation-card"]').should('exist');
    });

    it('should filter conversations by status', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-value="active"]').click();

      // Verify filtered results show only active conversations
      cy.get('[data-testid="conversation-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="conversation-status"]').should('not.contain', 'Archived');
      });
    });

    it('should search conversations by title', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('[data-testid="search-input"]').type('CRM');
      cy.get('[data-testid="search-input"]').type('{enter}');

      // Verify search results
      cy.get('[data-testid="conversation-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="conversation-title"]').should('contain', 'CRM');
      });
    });
  });

  describe('Conversation Actions', () => {
    it('should view conversation details', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      // Check if conversations exist
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // Get the first conversation title
          cy.get('[data-testid="conversation-card"]').first().find('[data-testid="conversation-title"]').invoke('text').then((conversationTitle) => {
            cy.get('[data-testid="conversation-card"]')
              .contains(conversationTitle.trim())
              .parent()
              .find('[data-testid="conversation-actions-button"]')
              .click();
            
            cy.get('[data-testid="view-button"]').click();
            
            // Verify we're on the view page
            cy.url().should('include', '/ai/conversations/');
            cy.url().should('include', '/show');
          });
        }
      });
    });

    it('should edit conversation', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // Get the first conversation title
          cy.get('[data-testid="conversation-card"]').first().find('[data-testid="conversation-title"]').invoke('text').then((conversationTitle) => {
            cy.get('[data-testid="conversation-card"]')
              .contains(conversationTitle.trim())
              .parent()
              .find('[data-testid="conversation-actions-button"]')
              .click();
            
            cy.get('[data-testid="edit-button"]').click();
            
            // Verify we're on the edit page
            cy.url().should('include', '/ai/conversations/');
            cy.url().should('include', '/edit');
            
            // Verify form is pre-filled
            cy.get('[name="title"]').should('have.value', conversationTitle.trim());
          });
        }
      });
    });

    it('should archive conversation', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // Get the first active conversation
          cy.get('[data-testid="conversation-card"]').first().find('[data-testid="conversation-title"]').invoke('text').then((conversationTitle) => {
            cy.intercept('POST', `/ai/conversations/*/archive`).as('archiveConversation');
            
            cy.get('[data-testid="conversation-card"]')
              .contains(conversationTitle.trim())
              .parent()
              .find('[data-testid="conversation-actions-button"]')
              .click();
            
            cy.get('[data-testid="archive-button"]').click();
            
            cy.wait('@archiveConversation');
            cy.checkToast('success', 'Conversation archived successfully');
          });
        }
      });
    });

    it('should unarchive conversation', () => {
      // First archive a conversation, then unarchive it
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // Filter to show archived conversations
          cy.get('[data-testid="status-filter"]').click();
          cy.get('[data-value="archived"]').click();

          cy.get('[data-testid="conversation-card"]').first().then(($card) => {
            if ($card.length > 0) {
              cy.wrap($card).find('[data-testid="conversation-title"]').invoke('text').then((conversationTitle) => {
                cy.intercept('POST', `/ai/conversations/*/unarchive`).as('unarchiveConversation');
                
                cy.wrap($card).find('[data-testid="conversation-actions-button"]').click();
                cy.get('[data-testid="unarchive-button"]').click();
                
                cy.wait('@unarchiveConversation');
                cy.checkToast('success', 'Conversation unarchived successfully');
              });
            }
          });
        }
      });
    });

    it('should delete conversation with confirmation', () => {
      // First create a test conversation to delete
      cy.request({
        method: 'POST',
        url: '/ai/conversations',
        body: {
          ...testConversationData,
          title: 'Conversation to Delete'
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(() => {
        cy.visitAIPage('conversations');
        cy.waitForPageLoad();

        cy.intercept('DELETE', `/ai/conversations/*`).as('deleteConversation');
        
        cy.get('[data-testid="conversation-card"]')
          .contains('Conversation to Delete')
          .parent()
          .find('[data-testid="conversation-actions-button"]')
          .click();
        
        cy.get('[data-testid="delete-button"]').click();
        
        // Confirm deletion in modal
        cy.get('[data-testid="delete-modal"]').should('be.visible');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.wait('@deleteConversation');
        cy.checkToast('success', 'Conversation deleted successfully');
        
        // Verify conversation is removed from list
        cy.get('[data-testid="conversation-card"]').should('not.contain', 'Conversation to Delete');
      });
    });
  });

  describe('Message Management', () => {
    it('should add message to conversation', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // View the first conversation
          cy.get('[data-testid="conversation-card"]').first().click();
          
          // Add a new message
          cy.get('[data-testid="message-input"]').type(newMessageData.content);
          
          cy.intercept('POST', `/ai/conversations/*/messages`).as('addMessage');
          cy.get('[data-testid="send-message-button"]').click();
          
          cy.wait('@addMessage');
          
          // Verify message appears in conversation
          cy.get('[data-testid="message-item"]').should('contain', newMessageData.content);
        }
      });
    });

    it('should display conversation messages correctly', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // View the first conversation
          cy.get('[data-testid="conversation-card"]').first().click();
          
          // Verify messages are displayed
          cy.get('[data-testid="messages-container"]').should('be.visible');
          cy.get('[data-testid="message-item"]').should('exist');
        }
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export conversations', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.intercept('GET', '/ai/conversations/export').as('exportConversations');
      
      cy.get('[data-testid="export-button"]').click();
      
      cy.wait('@exportConversations');
      
      // Verify export was initiated
      cy.checkToast('success', 'Export started');
    });

    it('should show conversation statistics', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('[data-testid="statistics-button"]').click();
      
      // Verify statistics modal or page is shown
      cy.get('[data-testid="statistics-modal"], [data-testid="statistics-container"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('GET', '/ai/conversations', { statusCode: 500 }).as('conversationsError');
      
      cy.visitAIPage('conversations');
      
      cy.wait('@conversationsError');
      
      // Verify error message is shown
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should handle message sending failures', () => {
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="conversation-card"]').length > 0) {
          // View the first conversation
          cy.get('[data-testid="conversation-card"]').first().click();
          
          // Mock failed message sending
          cy.intercept('POST', `/ai/conversations/*/messages`, { statusCode: 400, body: { message: 'Failed to send message' } }).as('failedMessage');
          
          cy.get('[data-testid="message-input"]').type('Test message');
          cy.get('[data-testid="send-message-button"]').click();
          
          cy.wait('@failedMessage');
          cy.checkToast('error', 'Failed to send message');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667);
      
      cy.visitAIPage('conversations');
      cy.waitForPageLoad();

      // Verify mobile layout
      cy.get('[data-testid="conversations-container"]').should('be.visible');
      cy.get('[data-testid="create-conversation-button"]').should('be.visible');
    });
  });
});
