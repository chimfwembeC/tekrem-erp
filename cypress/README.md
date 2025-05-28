# TekRem ERP Cypress E2E Testing Suite

This directory contains comprehensive end-to-end tests for the TekRem ERP AI module using Cypress.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Laravel application running on `http://localhost:8000`
- Database seeded with test data

### Installation
```bash
# Install dependencies
npm install

# Install Cypress binary
npx cypress install
```

### Running Tests

#### Headless Mode (CI/CD)
```bash
# Run all tests
npm run cypress:run

# Run specific test file
npx cypress run --spec "cypress/e2e/ai/ai-dashboard.cy.ts"

# Run tests with specific browser
npx cypress run --browser chrome
```

#### Interactive Mode (Development)
```bash
# Open Cypress Test Runner
npm run cypress:open

# Or directly
npx cypress open
```

## 📁 Test Structure

```
cypress/
├── e2e/                          # End-to-end test files
│   ├── ai/                       # AI module tests
│   │   ├── ai-dashboard.cy.ts    # Dashboard functionality
│   │   ├── ai-models.cy.ts       # Models CRUD operations
│   │   ├── ai-services.cy.ts     # Services management
│   │   ├── ai-conversations.cy.ts # Conversations interface
│   │   └── ai-prompt-templates.cy.ts # Template management
│   └── auth/                     # Authentication tests
│       ├── authentication.cy.ts  # Login/logout functionality
│       └── role-based-access.cy.ts # Permission testing
├── fixtures/                     # Test data
│   ├── ai-models.json           # Model test data
│   ├── ai-services.json         # Service test data
│   ├── ai-conversations.json    # Conversation test data
│   ├── ai-prompt-templates.json # Template test data
│   └── users.json               # User credentials
├── support/                      # Support files
│   ├── commands.ts              # Custom Cypress commands
│   ├── e2e.ts                   # Global configuration
│   ├── page-objects/            # Page Object Models
│   │   ├── ai-dashboard.page.ts
│   │   ├── ai-models.page.ts
│   │   └── index.ts
│   └── utils/                   # Test utilities
│       └── test-helpers.ts      # Helper functions
└── README.md                    # This file
```

## 🧪 Test Coverage

### AI Module Tests
- **Dashboard**: Analytics, service status, quick actions, navigation
- **Models**: CRUD operations, filtering, pagination, validation
- **Services**: Configuration, connection testing, status management
- **Conversations**: Message management, archiving, export functionality
- **Prompt Templates**: Template creation, rendering, rating, duplication

### Authentication Tests
- **Login/Logout**: Credential validation, session management
- **Role-Based Access**: Admin vs Staff permissions, route protection

### Cross-Cutting Concerns
- **Responsive Design**: Mobile, tablet, desktop layouts
- **Error Handling**: API errors, network failures, validation
- **Performance**: Page load times, memory usage
- **Accessibility**: Keyboard navigation, ARIA labels

## 🛠 Custom Commands

### Authentication
```typescript
cy.loginAsAdmin()           // Login with admin credentials
cy.loginAsStaff()          // Login with staff credentials
cy.loginAs(email, password) // Login with custom credentials
cy.logout()                // Logout current user
```

### Navigation
```typescript
cy.visitAIPage('dashboard')      // Navigate to AI dashboard
cy.visitAIPage('models')         // Navigate to AI models
cy.visitAIPage('services')       // Navigate to AI services
cy.visitAIPage('conversations')  // Navigate to conversations
cy.visitAIPage('prompt-templates') // Navigate to templates
```

### Utilities
```typescript
cy.waitForPageLoad()             // Wait for page to fully load
cy.getByTestId('element-id')     // Get element by data-testid
cy.fillForm({field: 'value'})    // Fill form fields
cy.checkToast('success', 'message') // Verify toast notifications
cy.waitForAPI('POST', '/api/url') // Wait for API requests
```

## 📊 Page Object Models

Page Object Models are used to encapsulate page-specific logic and selectors:

```typescript
import { AIDashboardPage } from '../support/page-objects';

const dashboardPage = new AIDashboardPage();

dashboardPage
  .visit()
  .waitForLoad()
  .verifyPageTitle()
  .verifyStatsCards();
```

## 🔧 Configuration

### Environment Variables
Configure in `cypress.config.ts`:

```typescript
env: {
  apiUrl: 'http://localhost:8000/api',
  adminEmail: 'admin@tekrem.com',
  adminPassword: 'password',
  staffEmail: 'staff@tekrem.com',
  staffPassword: 'password'
}
```

### Test Data
Test data is stored in `cypress/fixtures/` and can be loaded in tests:

```typescript
cy.fixture('ai-models').then((data) => {
  const testModel = data.validModel;
  // Use test data
});
```

## 🚨 Best Practices

### Selectors
- Use `data-testid` attributes for reliable element selection
- Avoid CSS selectors that may change with styling updates
- Use semantic selectors when `data-testid` is not available

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names that explain the expected behavior
- Keep tests independent and atomic

### Data Management
- Use fixtures for consistent test data
- Clean up test data after tests complete
- Use API calls for test setup when possible

### Error Handling
- Test both success and failure scenarios
- Verify error messages and user feedback
- Test edge cases and boundary conditions

## 🔍 Debugging

### Visual Debugging
```bash
# Run with headed browser
npx cypress run --headed

# Run with specific browser
npx cypress run --browser chrome --headed

# Open specific test in Test Runner
npx cypress open --spec "cypress/e2e/ai/ai-dashboard.cy.ts"
```

### Screenshots and Videos
- Screenshots are automatically taken on test failures
- Videos are recorded for all test runs
- Files are saved in `cypress/screenshots/` and `cypress/videos/`

### Console Logs
```typescript
// Add debug information
cy.log('Custom debug message');

// Log variables
cy.then(() => {
  console.log('Debug info:', someVariable);
});
```

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cypress-io/github-action@v2
        with:
          start: npm run dev
          wait-on: 'http://localhost:8000'
          wait-on-timeout: 120
```

### Test Reports
- Use `cypress-mochawesome-reporter` for HTML reports
- Integrate with CI/CD pipelines for automated reporting
- Archive test artifacts (screenshots, videos, reports)

## 🤝 Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Use Page Object Models for complex interactions
4. Add test data to fixtures if needed
5. Update this README if adding new patterns

### Updating Page Objects
1. Add new selectors with `data-testid` attributes
2. Create reusable methods for common actions
3. Keep methods focused and atomic
4. Document complex interactions

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices Guide](https://docs.cypress.io/guides/references/best-practices)
- [Page Object Model Pattern](https://docs.cypress.io/guides/references/best-practices#Page-Objects)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)

## 🐛 Troubleshooting

### Common Issues

**Tests failing due to timing issues:**
- Increase timeout values in `cypress.config.ts`
- Use proper wait conditions (`cy.wait()`, `cy.should()`)
- Avoid hard-coded delays (`cy.wait(1000)`)

**Element not found errors:**
- Verify `data-testid` attributes are present
- Check if elements are hidden or not yet rendered
- Use `cy.get().should('be.visible')` for visibility checks

**Authentication issues:**
- Verify test user credentials in fixtures
- Check if session management is working correctly
- Clear cookies/localStorage between tests if needed

**API request failures:**
- Verify Laravel application is running
- Check database seeding and test data
- Use network tab in browser dev tools for debugging
