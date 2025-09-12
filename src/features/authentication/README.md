# Authentication Feature Guide

This folder implements the frontend side of auth for Simonair using React, TanStack Router/Query, Axios, and a backend API.

## Key Files
- Context: `context/AuthContext.tsx` (session state, login/register/logout, auto-refresh)
- Hook: `hooks/useAuth.ts` (typed access to context)
- Guard: `components/RouteGuard.tsx` (protects routes and redirects to `/login`)
- HTTP: `src/utils/apiClient.ts` (Axios instance + interceptors)
- Events: `src/utils/eventBus.ts` (auth lifecycle events)

## Backend API Contract
- Endpoints used: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/reset-password/validate/:token`, `/auth/profile`.
- Responses include `data.accessToken` on login/register/refresh; refresh token is httpOnly cookie set by API.
- Axios is configured with `withCredentials: true`; ensure CORS allows credentials.

## Token, Refresh, and Session Flow
- Storage: Access token is encrypted per-device using AES-GCM with a browser fingerprint and saved to `localStorage` under `simonairToken` (`utils/fingerprint.ts`). User snapshot may be stored as `simonairUser`.
- Startup: `AuthProvider` decrypts token, verifies expiry, schedules auto refresh, and emits a profile fetch to `/auth/profile`.
- Auto Refresh: `AuthContext` schedules refresh ≈2 minutes before expiry; rate-limits attempts. `apiClient` also retries 401s by calling `/auth/refresh`, queues concurrent requests, updates the Authorization header, and resumes queued calls.
- Logout: Calls `/auth/logout`, clears local storage, cancels refresh timers, clears React Query cache, and navigates to `/login`.

## Usage Examples
Wrap app (already done in `src/utils/AppProvider.tsx`):

```tsx
const { login, logout, isAuthenticated, user } = useAuth();
await login({ email, password }); // navigates to /dashboard on success
await logout(); // clears session
```

Protect routes:

```tsx
<RouteGuard protected redirectTo="/login">{children}</RouteGuard>
```

HTTP calls: use `apiClient`; Authorization header is injected automatically when a token exists.

## Google OAuth (FE Flow)
Backend should expose `/auth/google` (returns provider URL) and `/auth/google/callback` (sets refresh cookie and returns `accessToken`). FE flow:
1) GET `/auth/google?redirectUri=${encodeURIComponent(window.location.origin)}` and `window.location.assign(url)`.
2) On callback page, read `code` then call `/auth/google/callback?code=...&redirectUri=<origin>` with credentials; save `data.accessToken` via context just like login.

Note: The Google button is scaffolded in `pages/LoginPage.tsx` (commented). Implement a click handler following the flow above when backend is ready.

## Configuration
- Base URL: set `VITE_BASE_URL` so `apiClient` points to the API. Cross-origin requires API CORS with `credentials` and proper cookie `SameSite`/`Secure`.
- Env access: `import.meta.env.VITE_*`.

## Troubleshooting
- 401 loops: verify API sends refresh cookie and `withCredentials` is allowed by CORS.
- Refresh fails: ensure `/auth/refresh` returns `{ data: { accessToken } }` and cookie domain/path match the FE origin.
- Profile null: confirm `/auth/profile` returns user data and Authorization header is honored.
**Query Parameters:**
- `code` - Authorization code from Google
- `state` - CSRF protection state
 - `redirectUri` (optional) - Frontend URL to redirect after success

**Example:**
```bash
curl -X GET "http://localhost:3000/auth/google/callback?code=AUTH_CODE&redirectUri=http://localhost:5173" -c cookies.txt
```
Returns the same structure as login and sets `refresh_token` cookie.

### OAuth Flow (SPA)
1. FE requests URL: `GET /auth/google?redirectUri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`.
2. Redirect user to returned Google URL.
3. FE callback page reads `code` from the URL and calls `/auth/google/callback?code=...&redirectUri=<FE_ORIGIN>` with `credentials: 'include'`.
4. Server issues `accessToken` in body and refresh cookie.
5. FE stores `accessToken` and uses it for Authorization headers.

#### POST /auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "If the email exists, a password reset link has been sent."
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/auth/forgot-password",
    "executionTime": 123
  }
}
```

#### GET /auth/reset-password/validate/:token
Validate reset token.

**Response:**
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "message": "Token is valid"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/auth/reset-password/validate/...",
    "executionTime": 123
  }
}
```

#### POST /auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "123e4567-e89b-12d3-a456-426614174000",
  "password": "NewStrongPassword123!",
  "confirmPassword": "NewStrongPassword123!"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "message": "Password has been reset successfully"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/auth/reset-password",
    "executionTime": 123
  }
}
```

### Protected Endpoints

#### GET /auth/profile
Get authenticated user profile.

**Headers:**
- `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "emailVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/auth/profile",
    "executionTime": 123
  }
}
```

## Error Responses

All error responses follow this structure:

```json
{
  "status": "error",
  "error": {
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/auth/login",
    "executionTime": 123
  }
}
```

Common error codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid credentials or token)
- 409: Conflict (email already exists)
- 429: Too Many Requests (rate limit exceeded)

## Environment Variables

Required environment variables:

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

# Email Configuration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Refresh Cookie Settings (for cross-site OAuth)
# Use SameSite=None and Secure=true when FE and API are on different sites
REFRESH_COOKIE_SAMESITE=lax   # lax | strict | none
REFRESH_COOKIE_SECURE=true    # set true when SameSite=none or in production
REFRESH_COOKIE_DOMAIN=.yourdomain.com

## React + Vite Integration (Auth)

See root README for a full guide. Minimal example:

```ts
// login
const r = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
const { data } = await r.json();
let accessToken = data.accessToken;

// refresh on 401
async function refresh() {
  const rr = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
  const { data } = await rr.json();
  return data.accessToken;
}

// oauth callback
const code = new URLSearchParams(location.search).get('code');
if (code) {
  const or = await fetch(`/auth/google/callback?code=${encodeURIComponent(code)}&redirectUri=${encodeURIComponent(window.location.origin)}`, { credentials: 'include' });
  const { data } = await or.json();
  accessToken = data.accessToken;
}
```
```

## Database Migrations

Run the following migration to create required tables:

```bash
npm run migration:run
```

This will create:
- `login_attempts` table for rate limiting
- `refresh_tokens` table for refresh token storage

## Frontend Integration

### Storing Tokens

1. **Access Token**: Store in memory or localStorage (less secure)
2. **Refresh Token**: Automatically stored as httpOnly cookie

### Making Authenticated Requests

```javascript
// Add access token to headers
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh Flow

```javascript
// When access token expires (401 response)
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Include cookies
});

const { data } = await refreshResponse.json();
const newAccessToken = data.accessToken;
```

## Security Best Practices

1. **Always use HTTPS** in production
2. **Store refresh tokens** in httpOnly cookies only
3. **Implement token rotation** (already done)
4. **Monitor failed login attempts** via login_attempts table
5. **Use strong passwords** (enforced by validation)
6. **Enable email verification** for production
7. **Implement 2FA** for additional security (future enhancement)

## Extending the Module

### Adding Email Verification

1. Update registration to send verification email
2. Add endpoint to verify email token
3. Restrict login for unverified emails if needed

### Adding Two-Factor Authentication

1. Add TOTP secret to user entity
2. Create endpoints for enabling/disabling 2FA
3. Update login flow to check for 2FA

### Custom OAuth Providers

1. Create new Passport strategy
2. Add configuration for provider
3. Create callback endpoint
4. Update auth service to handle new provider

## Troubleshooting

### Common Issues

1. **"Invalid refresh token"**
   - Check if refresh token cookie is being sent
   - Verify cookie domain/path settings
   - Check if token hasn't expired

2. **"Too many requests"**
   - Wait for rate limit window to expire
   - Check login_attempts table for debugging

3. **Google OAuth not working**
   - Verify redirect URI matches Google Console
   - Check client ID and secret
   - Ensure callback URL is correct
