# Security and Privacy Checklist

## Authentication
- Use Better Auth's supported configuration and mobile integration guidance for the chosen versions.
- Email verification is disabled for this MVP by product decision; document this explicitly.
- Validate all inputs on the server.
- Enforce authorization on every user-owned resource.
- Never trust a user ID supplied by the client.
- Clear client session state on sign-out and handle expired sessions predictably.
- Do not log passwords, cookies, bearer tokens, authorization headers or raw sensitive request bodies.

## Secrets and storage
- Commit `.env.example`, never `.env`.
- Keep database credentials and Better Auth secret on the server only.
- Use Expo SecureStore only for sensitive client session material when the selected auth design requires it.
- Use AsyncStorage only for non-sensitive local data.
- Do not embed server secrets in `EXPO_PUBLIC_*` variables.
- Scan commits for accidental credentials before pushing.

## API protections
- Explicit production CORS allowlist.
- Request validation and reasonable body-size limits.
- Rate limiting for authentication and write endpoints where supported.
- Safe error responses without stack traces or database details in production.
- Parameterized ORM queries.
- TLS for deployed traffic.
- Restrict database network access where the host supports it.
- Keep dependencies updated and use lockfile-based installs.

## Privacy and permissions
- Location and notifications are optional.
- Explain value before OS permission requests.
- Provide a manual fallback if location is denied.
- Store region-level location rather than precise coordinates unless essential.
- Do not send analytics or location to third parties without a clear need and disclosure.
- Provide sign-out and a documented account/data deletion path if time permits.
- Include a short privacy note in the app and README.

## Release checks
- Confirm no secrets in git history or app bundle.
- Confirm user ownership isolation in integration tests.
- Confirm production CORS and environment variables.
- Confirm auth callback/deep link configuration.
- Confirm SecureStore failure and session-expiry behavior.
- Confirm debug logs and development endpoints are not exposed in production.
