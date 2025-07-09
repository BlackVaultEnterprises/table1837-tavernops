// Staging Environment Configuration

export const stagingConfig = {
  // Cloudflare Pages staging branch
  branch: 'staging',
  
  // Staging-specific environment variables
  environment: {
    VITE_API_URL: 'https://staging-api.table1837-glenrock.workers.dev',
    VITE_PUSHER_KEY: process.env.STAGING_PUSHER_KEY,
    VITE_ENVIRONMENT: 'staging',
    
    // Feature flags for staging
    VITE_FEATURE_FLAGS: {
      newChecklistUI: true,
      aiMenuAnalysis: true,
      advancedAnalytics: false,
    }
  },
  
  // Staging database (separate from production)
  database: {
    url: process.env.STAGING_NEON_DATABASE_URL,
    schema: 'staging',
  },
  
  // Staging-specific Sentry project
  sentry: {
    dsn: process.env.STAGING_SENTRY_DSN,
    environment: 'staging',
    tracesSampleRate: 1.0, // 100% in staging for debugging
  }
};

// Branch preview configuration
export const previewConfig = {
  // Each PR gets its own preview
  urlPattern: 'https://pr-{number}.table1837-glenrock.pages.dev',
  
  // Preview uses production APIs in read-only mode
  apiMode: 'read-only',
  
  // Preview-specific features
  features: {
    debugPanel: true,
    performanceOverlay: true,
  }
};