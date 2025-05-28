import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Test files configuration
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Environment variables
    env: {
      // API endpoints
      apiUrl: 'http://localhost:8000/api',
      
      // Test user credentials
      adminEmail: 'admin@tekrem.com',
      adminPassword: 'password',
      staffEmail: 'staff@tekrem.com',
      staffPassword: 'password',
      
      // AI module specific
      aiDashboardUrl: '/ai/dashboard',
      aiModelsUrl: '/ai/models',
      aiServicesUrl: '/ai/services',
      aiConversationsUrl: '/ai/conversations',
      aiPromptTemplatesUrl: '/ai/prompt-templates',
    },
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task for database seeding/cleanup
      on('task', {
        'db:seed': () => {
          // Database seeding logic
          return null;
        },
        'db:clean': () => {
          // Database cleanup logic
          return null;
        },
        log(message) {
          console.log(message);
          return null;
        },
      });
      
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
});
