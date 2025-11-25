# User/Auth Domain (Authentication & Authorization)

## 🎯 Overview
Manages user authentication, authorization, and JWT token management for the Monetaris system.

This domain uses **Vertical Slice Architecture** with **AI-First + Vibe-First** principles:
- Each endpoint is a separate file (<150 lines)
- Template files show AI how to create new auth endpoints safely
- Services contain business logic (AuthService, JwtTokenGenerator)
- Models (DTOs) define data contracts

## 📡 API Endpoints

### POST /api/auth/login
**File**: `api/Login.cs`
**Purpose**: Authenticate users (ADMIN, AGENT, CLIENT) with email and password
**Authorization**: Public (no auth required)
**Request**: `LoginRequest` (email, password)
**Response**: `AuthResponse` (access token, refresh token, user info)

**Flow**:
1. Validate email and password against database
2. Verify password using BCrypt
3. Check if user account is active
4. Generate JWT access token (8 hour expiry)
5. Generate refresh token (30 day expiry, stored in DB)
6. Return tokens and user details

**Error Cases**:
- 400: Invalid email or password
- 400: User account is inactive

### POST /api/auth/login-debtor
**File**: `api/LoginDebtor.cs`
**Purpose**: Authenticate debtors using "magic link" (case number + zip code)
**Authorization**: Public (no auth required)
**Request**: `LoginDebtorRequest` (invoiceNumber, zipCode)
**Response**: `AuthResponse`

**Flow**:
1. Find collection case by invoice number
2. Verify zip code matches debtor's address
3. Find or create DEBTOR user account (auto-generated email: `debtor_{debtorId}@monetaris.system`)
4. Generate JWT tokens
5. Return tokens and user details

**Business Rules**:
- Creates DEBTOR user account on first login
- Uses random password (debtors never use password login)
- Scoped to single tenant (case's tenant)

**Error Cases**:
- 400: Invalid case number or zip code mismatch

### POST /api/auth/register
**File**: `api/Register.cs`
**Purpose**: Register new user accounts (ADMIN, AGENT, CLIENT)
**Authorization**: Public (no auth required, but typically ADMIN-only in production)
**Request**: `RegisterRequest` (name, email, password, role, tenantId)
**Response**: `AuthResponse`

**Flow**:
1. Check if email already exists (must be unique)
2. Validate tenant ID (required for CLIENT role)
3. Hash password using BCrypt
4. Create user in database
5. Generate JWT tokens
6. Return tokens and user details

**Business Rules**:
- Email must be unique
- CLIENT role requires TenantId
- Password is hashed using BCrypt (never stored in plaintext)
- User is automatically activated (IsActive = true)

**Error Cases**:
- 400: Email already registered
- 400: Tenant ID required for CLIENT role
- 400: Tenant not found

### POST /api/auth/refresh
**File**: `api/RefreshToken.cs`
**Purpose**: Refresh access token using refresh token
**Authorization**: Public (refresh token validated via database)
**Request**: `RefreshTokenRequest` (refreshToken)
**Response**: `AuthResponse` (new access token, new refresh token)

**Flow**:
1. Find refresh token in database
2. Verify token is not revoked
3. Verify token is not expired
4. Verify user is still active
5. Revoke old refresh token
6. Generate new JWT access token and refresh token
7. Return new tokens

**Business Rules**:
- Old refresh token is revoked after use (rotation)
- Refresh tokens expire after 30 days
- Access tokens expire after 8 hours
- User must be active to refresh

**Error Cases**:
- 400: Invalid refresh token
- 400: Refresh token has been revoked
- 400: Refresh token has expired
- 400: User account is inactive

### POST /api/auth/logout
**File**: `api/Logout.cs`
**Purpose**: Logout user by revoking refresh token
**Authorization**: Required (Bearer token)
**Request**: `RefreshTokenRequest` (refreshToken)
**Response**: 204 No Content

**Flow**:
1. Extract user ID from JWT claims
2. Find refresh token in database
3. Mark token as revoked (RevokedAt = DateTime.UtcNow)
4. Save changes
5. Return 204 No Content

**Business Rules**:
- Revokes only the specific refresh token (user may have multiple sessions)
- Does not invalidate access token (JWT is stateless)
- Access token will expire naturally after 8 hours

**Error Cases**:
- 400: Refresh token not found
- 401: User not authenticated

### GET /api/auth/me
**File**: `api/GetCurrentUser.cs`
**Purpose**: Get currently authenticated user details
**Authorization**: Required (Bearer token)
**Response**: `UserDto`

**Flow**:
1. Extract user ID from JWT claims (ClaimTypes.NameIdentifier)
2. Query database for user with TenantAssignments
3. Map to UserDto (excludes password hash)
4. Return user details

**Business Rules**:
- Returns user without sensitive data (no password hash)
- Includes AssignedTenantIds for AGENT role
- Includes TenantId for CLIENT role

**Error Cases**:
- 401: Invalid or missing token
- 404: User not found in database

## 🔒 Business Rules

### Authentication Rules

1. **Password Security**:
   - Passwords are hashed using BCrypt with auto-generated salt
   - Minimum password strength enforced via validators (8+ chars, complexity)
   - Passwords are NEVER logged or returned in responses
   - Failed login attempts should be rate-limited (consider implementing in future)

2. **JWT Token Expiration**:
   - Access tokens: 8 hours (configured in appsettings.json: `Jwt:ExpirationInMinutes`)
   - Refresh tokens: 30 days (hardcoded in AuthService)
   - Tokens include claims: UserId, Email, Name, Role, TenantId, AssignedTenantIds

3. **Role-Based Access**:
   - **ADMIN**: Full system access, can manage all users and kreditoren
   - **AGENT**: Access to assigned kreditoren only (via UserTenantAssignments)
   - **CLIENT**: Access to own kreditor only (via TenantId)
   - **DEBTOR**: Limited portal access to own cases only

4. **Debtor Magic Link Rules**:
   - Debtors authenticate via case number (InvoiceNumber) + zip code
   - System auto-creates DEBTOR user account on first login
   - Email format: `debtor_{debtorId}@monetaris.system`
   - Random password generated (debtors never use password login)
   - DEBTOR users cannot login via standard email/password endpoint

### Security Best Practices

1. **Logging**:
   - NEVER log passwords or tokens (access tokens, refresh tokens)
   - Log authentication attempts with email (but not password)
   - Log failed authentication attempts with reason
   - Include user ID in logout logs
   - Consider logging IP address for security audits

2. **Error Messages**:
   - Use generic error messages to prevent user enumeration
   - "Invalid email or password" (don't reveal if email exists)
   - "Invalid case number or zip code" (don't reveal which is wrong)

3. **Token Rotation**:
   - Refresh tokens are rotated on each use (old token revoked)
   - Access tokens are stateless (cannot be revoked until expiry)
   - Consider implementing token blacklist for critical security scenarios

## 🧩 Services

### IAuthService
Located in: `services/IAuthService.cs`

Methods:
- `Task<Result<AuthResponse>> LoginAsync(LoginRequest request)`
- `Task<Result<AuthResponse>> LoginDebtorAsync(LoginDebtorRequest request)`
- `Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)`
- `Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken)`
- `Task<Result> LogoutAsync(string refreshToken)`

### AuthService
Located in: `services/AuthService.cs`

Dependencies:
- `IApplicationDbContext` - Database access
- `IJwtTokenGenerator` - Token generation
- `IConfiguration` - JWT settings

Key Methods:
- `GenerateAuthResponseAsync()` - Creates AuthResponse with JWT tokens
- `GetInitials()` - Generates avatar initials from name

### IJwtTokenGenerator
Located in: `services/IJwtTokenGenerator.cs`

Methods:
- `string GenerateAccessToken(User user, List<Guid>? assignedTenantIds)`
- `string GenerateRefreshToken()`

### JwtTokenGenerator
Located in: `services/JwtTokenGenerator.cs`

Dependencies:
- `IConfiguration` - JWT settings (SecretKey, Issuer, Audience, ExpirationInMinutes)

JWT Claims Included:
- `sub` / `ClaimTypes.NameIdentifier` - User ID
- `email` / `ClaimTypes.Email` - Email
- `name` / `ClaimTypes.Name` - Full name
- `role` / `ClaimTypes.Role` - User role
- `tenantId` - Primary tenant ID (for CLIENT)
- `assignedTenantIds` - Comma-separated list (for AGENT)

## 📦 Models (DTOs)

### LoginRequest
**Purpose**: Standard email/password login

**Properties**:
- `Email` (string, required)
- `Password` (string, required)

### LoginDebtorRequest
**Purpose**: Debtor magic link authentication

**Properties**:
- `InvoiceNumber` (string, required) - Case/invoice number
- `ZipCode` (string, required) - Zip code from debtor's address

### RegisterRequest
**Purpose**: User registration

**Properties**:
- `Name` (string, required)
- `Email` (string, required, unique)
- `Password` (string, required, min 8 chars)
- `Role` (UserRole enum, required)
- `TenantId` (Guid?, required for CLIENT role)

### RefreshTokenRequest
**Purpose**: Token refresh and logout

**Properties**:
- `RefreshToken` (string, required) - Refresh token to exchange or revoke

### AuthResponse
**Purpose**: Authentication response with JWT tokens

**Properties**:
- `AccessToken` (string) - JWT access token for API authentication
- `RefreshToken` (string) - Refresh token for obtaining new access tokens
- `ExpiresIn` (int) - Token expiration time in seconds
- `User` (UserDto) - Authenticated user details

### UserDto
**Purpose**: User information (excludes sensitive data)

**Properties**:
- `Id` (Guid)
- `Name` (string)
- `Email` (string)
- `Role` (UserRole enum)
- `TenantId` (Guid?, for CLIENT)
- `AssignedTenantIds` (List<Guid>?, for AGENT)
- `AvatarInitials` (string?)

## 🤖 AI Instructions

### When creating a NEW auth endpoint:

1. **Copy the appropriate template**:
   - POST (login/register/logout) → Copy `api/_TEMPLATE_Auth_Post.cs.template`
   - GET (user info) → Copy `api/_TEMPLATE_Auth_Get.cs.template`

2. **Modify only these sections**:
   - Class name (match the endpoint purpose)
   - Route attribute (e.g., `[HttpPost("login")]`)
   - Method parameters (e.g., `[FromBody] LoginRequest request`)
   - Service method call (e.g., `_authService.LoginAsync(request)`)
   - Log messages (describe what's happening)

3. **NEVER change**:
   - Constructor injection pattern
   - `Result<T>` return pattern
   - Error handling structure
   - HTTP status codes (200/204/400/401)

4. **Always include**:
   - XML documentation (/// summary)
   - `ProducesResponseType` attributes for all possible responses
   - `ILogger` usage for information and warnings
   - Proper error messages with context

5. **Security Requirements**:
   - NEVER log passwords or tokens
   - Use `_logger.LogWarning` for failed authentication attempts
   - Return generic error messages (don't reveal if email exists)
   - Add `[Authorize]` attribute only when authentication is required

### When creating a TEST:

1. Copy `tests/_TEMPLATE_Auth_Test.cs.template`
2. Test matrix (test ALL scenarios):
   - Success case (200/204)
   - Invalid credentials (400)
   - User not found (404 for GET /me)
   - Authorization (401 if [Authorize] is used)
   - Business rule violations (inactive user, expired token, etc.)

### Code Quality Rules:

- **Max 150 lines per endpoint file** (strict limit)
- **Max 300 lines per service class** (strict limit)
- Every class must have a test
- 90%+ code coverage required
- 0 bugs, A rating in SonarQube

### Logging Pattern:

```csharp
// At start of endpoint (PUBLIC endpoints)
_logger.LogInformation("Login attempt for email: {Email}", request.Email);

// On success
_logger.LogInformation("Login successful for email: {Email}", request.Email);

// On error
_logger.LogWarning("Login failed for email: {Email}. Error: {Error}", request.Email, result.ErrorMessage);

// NEVER log passwords or tokens
// ❌ BAD: _logger.LogInformation("Password: {Password}", password);
// ❌ BAD: _logger.LogInformation("Token: {Token}", token);
```

### Result<T> Pattern:

All auth service methods MUST return `Result<T>`:

```csharp
// In service
return Result<AuthResponse>.Success(authResponse);
return Result<AuthResponse>.Failure("Invalid email or password");
return Result.Success();  // For void operations like Logout
return Result.Failure("Refresh token not found");

// In endpoint
if (!result.IsSuccess)
    return BadRequest(new { error = result.ErrorMessage });
return Ok(result.Data);
```

### Authorization Pattern:

```csharp
// For PUBLIC endpoints (login, register, refresh)
// NO [Authorize] attribute needed

// For PROTECTED endpoints (logout, get current user)
[Authorize]  // Requires valid JWT token
public async Task<IActionResult> Handle()
{
    // Extract user ID from claims
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(userId))
    {
        return Unauthorized(new { error = "Invalid token" });
    }

    // Continue with business logic
}
```

### Endpoint Naming Convention:

- **Class name** = `VerbNoun` (e.g., `Login`, `LoginDebtor`, `RefreshToken`, `GetCurrentUser`)
- **Method name** = `Handle` (always, OR add `Async` suffix: `HandleAsync`)
- **Route** = `/api/auth` (singular, all auth endpoints under same base route)

### Example - Creating a new auth endpoint:

```csharp
// 1. Copy api/_TEMPLATE_Auth_Post.cs.template to api/ChangePassword.cs
// 2. Rename class: _TEMPLATE_Auth_Post → ChangePassword
// 3. Update route: [HttpPost("change-password")]
// 4. Update service call: _authService.ChangePasswordAsync(request)
// 5. Update logging: "Password change attempt for user: {UserId}"
// 6. Add [Authorize] if authentication is required
```

## 🧪 Testing

Run tests for this domain:
```bash
cd Backend
dotnet test --filter "FullyQualifiedName~Monetaris.User.Tests"
```

Generate coverage report:
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## 📝 Architecture Notes

### Vertical Slice Architecture

This domain uses **Vertical Slice Architecture** instead of traditional layered architecture:

**Traditional Layered** (OLD):
```
Controllers/ (all controllers together)
Services/ (all services together)
DTOs/ (all DTOs together)
```

**Vertical Slice** (NEW):
```
api/ (one file per endpoint - vertical slice)
services/ (business logic)
models/ (data contracts)
tests/ (one test per endpoint)
```

**Benefits**:
- Each endpoint is isolated and easy to understand
- Changes to one endpoint don't affect others
- AI can easily generate new endpoints from templates
- Easier to test individual features
- Better for code review (small, focused files)

### AI-First Principles

This domain is designed for **90% AI automation**:

1. **Templates** (`_TEMPLATE_*.cs.template`): Show AI exactly how to create endpoints
2. **README.md**: Comprehensive instructions for AI to follow
3. **Strict file size limits**: Force simple, focused code
4. **Consistent patterns**: Same structure in every file
5. **Heavy documentation**: 🤖 comments guide AI behavior

**Human Role**: Only reviews Merge Requests for correctness and business logic.

## 🔄 Migration Notes

This domain was renamed from "DTOs" to "models" for consistency:
- Folder: `DTOs/` → `models/`
- Namespace: `Monetaris.User.DTOs` → `Monetaris.User.Models`

## 🚀 Next Steps

Future authentication enhancements:
- Implement rate limiting for login attempts
- Add IP address logging for security audits
- Implement token blacklist for emergency revocation
- Add two-factor authentication (2FA)
- Add password reset flow (forgot password)
- Add email verification for new registrations
- Add OAuth2/OpenID Connect for social login
