# Development-only Swagger UI

## Goal

Expose the Swagger document and UI at `/api/docs` only when
`NODE_ENV=development`. Swagger must not be initialized in production, test,
or when `NODE_ENV` is unset.

## Design

Keep the change local to `apps/backend/src/main.ts`. Wrap the existing
`DocumentBuilder`, `SwaggerModule.createDocument`, and `SwaggerModule.setup`
statements in this exact condition:

```typescript
if (process.env.NODE_ENV === 'development') {
  // Existing Swagger configuration and setup.
}
```

The application bootstrap order, global API prefix, versioning, validation,
CORS, cookies, logging, and listen address remain unchanged. No new helper,
configuration file, dependency, or endpoint is introduced.

## Verification

Run the backend test suite and TypeScript build. Review the resulting block to
confirm that all Swagger document creation and UI setup is inside the strict
development-only condition and that the server still starts outside that
condition.
