// Neon Database Configuration
export const neonConfig = {
  projectId: 'cold-surf-85059894',
  
  // Connection strings
  connections: {
    // Direct connection (for migrations)
    direct: 'postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
    
    // Pooled connection (for application)
    pooled: 'postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
    
    // Prisma connection
    prisma: 'postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15',
    
    // Edge function connection (serverless)
    edge: 'postgresql://neondb_owner:npg_yUzrV75hQIfM@ep-shy-math-aeg5mcxo-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&pool_timeout=0',
  },
  
  region: 'us-east-2',
  
  // Branch for staging
  stagingBranch: 'staging',
};