import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry for production monitoring
export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENVIRONMENT || 'production',
      
      integrations: [
        new BrowserTracing({
          // Trace all navigation
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes
          ),
          
          // Performance monitoring for key operations
          tracingOrigins: [
            'localhost',
            'table1837-glenrock.pages.dev',
            /^https:\/\/[\w-]+\.table1837-glenrock\.workers\.dev/,
          ],
        }),
        
        // Custom integration for restaurant-specific errors
        new RestaurantErrorIntegration(),
      ],
      
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION,
      
      // User context
      beforeSend(event, hint) {
        // Add user role context
        if (event.user) {
          event.user.role = getCurrentUserRole();
        }
        
        // Filter out non-critical errors in production
        if (import.meta.env.PROD && event.level === 'warning') {
          return null;
        }
        
        return event;
      },
    });
  }
};

// Custom integration for restaurant-specific monitoring
class RestaurantErrorIntegration {
  name = 'RestaurantErrorIntegration';
  
  setupOnce() {
    // Monitor 86 list sync failures
    Sentry.addGlobalEventProcessor((event) => {
      if (event.exception?.values?.[0]?.value?.includes('86 list sync')) {
        event.fingerprint = ['86-list-sync-error'];
        event.level = 'error';
      }
      return event;
    });
    
    // Track performance of critical operations
    this.monitorCriticalOperations();
  }
  
  monitorCriticalOperations() {
    // Monitor search performance
    const originalSearch = window.searchCocktails;
    window.searchCocktails = async (...args) => {
      const transaction = Sentry.startTransaction({
        name: 'cocktail-search',
        op: 'search',
      });
      
      try {
        const result = await originalSearch(...args);
        transaction.setStatus('ok');
        return result;
      } catch (error) {
        transaction.setStatus('internal_error');
        throw error;
      } finally {
        transaction.finish();
      }
    };
  }
}

// Performance monitoring helpers
export const measurePourCostCalculation = () => {
  const transaction = Sentry.startTransaction({
    name: 'pour-cost-calculation',
    op: 'calculation',
  });
  
  return {
    finish: (cocktailName: string, margin: number) => {
      transaction.setTag('cocktail', cocktailName);
      transaction.setTag('margin', margin);
      transaction.setStatus(margin < 70 ? 'warning' : 'ok');
      transaction.finish();
    }
  };
};

// Error boundary component
export const SentryErrorBoundary = Sentry.ErrorBoundary;