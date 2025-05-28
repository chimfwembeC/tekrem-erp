# Cypress Troubleshooting Guide for TekRem ERP

## 🚨 Common Issues and Solutions

### Issue: Cypress Binary Installation Fails

**Error Message:**
```
Cypress failed to start.
This may be due to a missing library or dependency.
Failed to load chrome_100_percent.pak
```

**Solution for Ubuntu/Debian:**
```bash
# Install required system dependencies
sudo apt-get update
sudo apt-get install -y \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3-dev \
    libxss1 \
    libasound2-dev \
    libxtst6 \
    xauth \
    xvfb

# For headless environments, install Xvfb
sudo apt-get install -y xvfb

# Reinstall Cypress
npm install cypress --save-dev
npx cypress install --force
```

**Solution for CentOS/RHEL:**
```bash
# Install required packages
sudo yum install -y \
    gtk2-devel \
    gtk3-devel \
    libnotify-devel \
    GConf2-devel \
    nss-devel \
    libXScrnSaver-devel \
    alsa-lib-devel \
    libXtst-devel \
    xorg-x11-server-Xvfb

# Reinstall Cypress
npm install cypress --save-dev
npx cypress install --force
```

### Issue: Running Cypress in Headless Environment

**Solution: Use Xvfb (Virtual Display)**
```bash
# Start virtual display
export DISPLAY=:99
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

# Run Cypress tests
npx cypress run
```

**Alternative: Use Docker**
```dockerfile
# Dockerfile for Cypress testing
FROM cypress/included:13.17.0

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
CMD ["npx", "cypress", "run"]
```

### Issue: Tests Failing Due to Timing

**Problem:** Elements not found or actions failing due to timing issues.

**Solutions:**
```typescript
// Use proper wait conditions instead of hard delays
cy.get('[data-testid="element"]').should('be.visible');

// Wait for API requests
cy.intercept('GET', '/api/data').as('getData');
cy.wait('@getData');

// Increase timeout for slow operations
cy.get('[data-testid="slow-element"]', { timeout: 10000 }).should('exist');

// Use retry-ability
cy.get('[data-testid="dynamic-content"]').should('contain', 'Expected Text');
```

### Issue: Authentication Problems

**Problem:** Tests failing due to authentication issues.

**Solutions:**
```typescript
// Clear session before each test
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Use session caching for faster tests
cy.session([email, password], () => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Verify authentication state
cy.get('[data-testid="user-menu"]').should('be.visible');
```

### Issue: Database State Problems

**Problem:** Tests failing due to inconsistent database state.

**Solutions:**
```bash
# Reset database before tests
php artisan migrate:fresh --seed --env=testing

# Use database transactions (in Laravel)
php artisan config:set database.connections.testing.database :memory:
```

```typescript
// Clean up test data
afterEach(() => {
  cy.task('db:clean');
});
```

### Issue: Flaky Tests

**Problem:** Tests passing/failing inconsistently.

**Solutions:**
```typescript
// Use proper assertions
cy.get('[data-testid="element"]')
  .should('be.visible')
  .and('contain', 'Expected Text');

// Avoid hard-coded waits
// ❌ Don't do this
cy.wait(5000);

// ✅ Do this instead
cy.get('[data-testid="loading"]').should('not.exist');

// Use retry logic for network requests
cy.intercept('POST', '/api/endpoint').as('apiCall');
cy.get('[data-testid="submit"]').click();
cy.wait('@apiCall').its('response.statusCode').should('eq', 200);
```

### Issue: Slow Test Execution

**Problem:** Tests taking too long to run.

**Solutions:**
```typescript
// Use efficient selectors
// ❌ Slow
cy.get('.complex > .nested > .selector');

// ✅ Fast
cy.get('[data-testid="specific-element"]');

// Parallelize tests
npx cypress run --record --parallel

// Skip unnecessary operations
cy.visit('/page', { 
  onBeforeLoad: (win) => {
    // Disable analytics, etc.
    win.gtag = cy.stub();
  }
});
```

### Issue: Memory Leaks

**Problem:** Browser running out of memory during long test runs.

**Solutions:**
```typescript
// Clear memory between tests
afterEach(() => {
  cy.window().then((win) => {
    win.location.reload();
  });
});

// Use smaller viewports for faster rendering
cy.viewport(1280, 720);

// Disable video recording for faster execution
// In cypress.config.ts
video: false,
screenshotOnRunFailure: false,
```

## 🔧 Environment-Specific Solutions

### Docker Environment
```yaml
# docker-compose.yml for testing
version: '3.8'
services:
  cypress:
    image: cypress/included:13.17.0
    working_dir: /e2e
    volumes:
      - ./:/e2e
    environment:
      - CYPRESS_baseUrl=http://app:8000
    depends_on:
      - app
  
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=testing
```

### GitHub Actions
```yaml
# .github/workflows/cypress.yml
name: Cypress Tests
on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start Laravel server
        run: |
          php artisan serve &
          sleep 5
        
      - name: Run Cypress tests
        uses: cypress-io/github-action@v2
        with:
          wait-on: 'http://localhost:8000'
          wait-on-timeout: 120
```

### WSL (Windows Subsystem for Linux)
```bash
# Install X11 forwarding for GUI
sudo apt-get install -y xorg

# Set display variable
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

# Install VcXsrv on Windows and configure X11 forwarding
```

## 🚀 Performance Optimization

### Faster Test Execution
```typescript
// cypress.config.ts optimizations
export default defineConfig({
  e2e: {
    // Reduce default timeouts for faster feedback
    defaultCommandTimeout: 4000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    
    // Disable video for faster execution
    video: false,
    
    // Reduce screenshot quality
    screenshotOnRunFailure: true,
    
    // Use faster browser
    browser: 'electron',
    
    // Optimize viewport
    viewportWidth: 1280,
    viewportHeight: 720,
  }
});
```

### Test Parallelization
```bash
# Run tests in parallel (requires Cypress Dashboard)
npx cypress run --record --parallel --ci-build-id $BUILD_ID

# Or use multiple spec files
npx cypress run --spec "cypress/e2e/ai/ai-models.cy.ts,cypress/e2e/ai/ai-services.cy.ts"
```

## 📊 Debugging Tools

### Cypress Debug Mode
```bash
# Run with debug output
DEBUG=cypress:* npx cypress run

# Open DevTools in headed mode
npx cypress run --headed --no-exit
```

### Browser DevTools
```typescript
// Add breakpoints in tests
cy.debug();

// Log variables
cy.then(() => {
  debugger; // Browser will pause here
});

// Take screenshots for debugging
cy.screenshot('debug-screenshot');
```

### Network Debugging
```typescript
// Log all network requests
cy.intercept('**', (req) => {
  console.log('Request:', req.method, req.url);
});

// Mock slow responses for testing
cy.intercept('GET', '/api/slow-endpoint', {
  delay: 2000,
  fixture: 'slow-response.json'
});
```

## 📞 Getting Help

### Useful Resources
- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress GitHub Issues](https://github.com/cypress-io/cypress/issues)
- [Cypress Discord Community](https://discord.gg/cypress)

### Common Commands for Debugging
```bash
# Check Cypress installation
npx cypress verify

# Get system info
npx cypress info

# Clear Cypress cache
npx cypress cache clear

# Reinstall Cypress
npm uninstall cypress
npm install cypress --save-dev
npx cypress install
```

### Log Collection
```bash
# Collect logs for support
DEBUG=cypress:* npx cypress run > cypress-debug.log 2>&1

# System information
uname -a > system-info.txt
node --version >> system-info.txt
npm --version >> system-info.txt
```

Remember: Most Cypress issues are related to timing, selectors, or environment setup. Start with the basics and work your way up to more complex solutions.
