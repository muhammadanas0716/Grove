# Migration Guide

To fix the schema validation error for existing users, run this in your Convex dashboard or via the CLI:

1. Go to your Convex dashboard: https://dashboard.convex.dev/d/amicable-magpie-90
2. Open the Functions tab
3. Run the `migrations:migrateUsers` mutation

Or via CLI:
```bash
npx convex run migrations:migrateUsers
```

This will add the missing subscription fields (`subscriptionStatus`, `polarCustomerId`, `subscriptionId`) to all existing users.
