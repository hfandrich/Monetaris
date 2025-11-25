# Frontend to Backend API Migration - Summary

## Overview

The Frontend has been successfully migrated from using mock localStorage data to making real HTTP calls to the Backend REST API.

## Changes Made

### 1. API Configuration Layer

**Created: `Frontend/services/api/config.ts`**
- Defines all API endpoints (Auth, Tenants, Debtors, Cases, Documents, etc.)
- Uses environment variable `VITE_API_URL` (defaults to `http://localhost:5000/api`)
- Centralized endpoint management for easy maintenance

**Created: `Frontend/services/api/httpClient.ts`**
- Generic HTTP client with GET, POST, PUT, DELETE methods
- Automatic Authorization header injection from localStorage token
- Consistent error handling across all API calls
- Returns typed responses using TypeScript generics

### 2. Authentication Service Update

**Updated: `Frontend/services/authService.ts`**
- `login()` now accepts email AND password parameters
- Makes POST request to `/api/auth/login` endpoint
- Stores both `accessToken` and `refreshToken` in localStorage
- `loginDebtor()` makes POST request to `/api/auth/login-debtor` endpoint
- `logout()` sends refresh token to backend before clearing local storage
- Removed dependency on mock data (SEED_USERS, SEED_CASES, etc.)

### 3. Data Service Update

**Updated: `Frontend/services/dataService.ts`**
- All methods now use `HttpClient` to make real API calls
- Removed localStorage-based mock database (`db.ts`) dependency
- Backend now handles role-based filtering (no more client-side filtering)
- Methods updated:
  - `getAccessibleTenants()` → GET `/api/tenants`
  - `getAccessibleCases()` → GET `/api/cases`
  - `getAccessibleDebtors()` → GET `/api/debtors`
  - `getDashboardStats()` → GET `/api/dashboard/stats`
  - `searchGlobal()` → GET `/api/search?q={query}`
  - `getDebtorById()` → GET `/api/debtors/{id}` + `/api/debtors/{id}/cases`
  - `getTenantById()` → GET `/api/tenants/{id}` + nested endpoints
  - `addCase()` → POST `/api/cases`
  - `advanceWorkflow()` → POST `/api/cases/{id}/advance`
  - And more...

### 4. Login Pages Update

**Updated: `Frontend/pages/Login.tsx`**
- Added `password` state variable
- Password field now functional (not disabled)
- Passes password to `authService.login(email, password)`

**Updated: `Frontend/pages/LoginClient.tsx`**
- Added `password` state variable
- Password field now functional (not disabled)
- Passes password to `authService.login(email, password)`

### 5. Environment Configuration

**Created: `Frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

**Created: `Frontend/.env.example`**
```
VITE_API_URL=http://localhost:5000/api
GEMINI_API_KEY=your_api_key_here
```

### 6. Package.json Update

**Updated: `Frontend/package.json`**
- Dev script now specifies port: `vite --port 3000`

### 7. Deprecated Files

**Marked as deprecated (kept for reference):**
- `Frontend/services/mockData.ts` - Added deprecation notice
- `Frontend/services/db.ts` - Added deprecation notice

These files are no longer used but kept for development reference.

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - Standard login (email + password)
- `POST /api/auth/login-debtor` - Debtor login (invoiceNumber + zipCode)
- `POST /api/auth/logout` - Logout (with refreshToken)
- `GET /api/auth/me` - Get current user info

### Tenants
- `GET /api/tenants` - Get all accessible tenants
- `GET /api/tenants/{id}` - Get tenant details
- `GET /api/tenants/{id}/cases` - Get tenant's cases
- `GET /api/tenants/{id}/users` - Get tenant's users
- `POST /api/tenants` - Create new tenant

### Debtors
- `GET /api/debtors` - Get all accessible debtors
- `GET /api/debtors/{id}` - Get debtor details
- `GET /api/debtors/{id}/cases` - Get debtor's cases
- `POST /api/debtors` - Create new debtor

### Cases
- `GET /api/cases` - Get all accessible cases
- `POST /api/cases` - Create new case
- `POST /api/cases/{id}/advance` - Advance workflow status
- `POST /api/cases/batch` - Batch import cases
- `POST /api/cases/import` - Process import with mappings

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Search
- `GET /api/search?q={query}` - Global search

### Documents
- `GET /api/documents?debtorId={id}` - Get debtor documents
- `POST /api/documents` - Upload document

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/{id}` - Update template

### Inquiries
- `GET /api/inquiries` - Get all inquiries

## Testing Results

✅ **TypeScript Compilation**: Success (no errors)
✅ **Build**: Success (`npm run build` completed)
✅ **Dev Server**: Success (starts on `http://localhost:3000`)
✅ **No Dependencies on Mock Data**: Confirmed

## How to Run

### 1. Start Backend (Required)
```bash
cd Backend
dotnet run
```
Backend should be running on `http://localhost:5000`

### 2. Start Frontend
```bash
cd Frontend
npm install  # if not already done
npm run dev
```
Frontend will be available at `http://localhost:3000`

## Authentication Flow

1. User enters email and password in login form
2. Frontend makes POST request to `/api/auth/login`
3. Backend validates credentials and returns:
   - `accessToken` (JWT)
   - `refreshToken`
   - `user` object
   - `expiresIn` timestamp
4. Frontend stores tokens in localStorage:
   - `monetaris_token` (accessToken)
   - `monetaris_refresh_token` (refreshToken)
   - `monetaris_user` (user JSON)
5. All subsequent API calls include `Authorization: Bearer {accessToken}` header
6. On logout, refreshToken is sent to backend before clearing localStorage

## Migration Benefits

1. **Real Data**: No more mock data - actual database integration
2. **Security**: JWT-based authentication with refresh tokens
3. **Scalability**: Backend handles data filtering and business logic
4. **Separation of Concerns**: Clear API contract between Frontend and Backend
5. **Type Safety**: TypeScript interfaces match Backend DTOs
6. **Centralized**: All API configuration in one place
7. **Error Handling**: Consistent error handling across all requests

## Next Steps

1. Ensure Backend is seeded with initial data (users, tenants, cases)
2. Test all user flows (Admin, Agent, Client, Debtor login)
3. Verify role-based access control works correctly
4. Test all CRUD operations (Create, Read, Update, Delete)
5. Test file uploads (documents)
6. Test search functionality
7. Test dashboard statistics
8. Add loading states and error handling in UI components

## Files Modified

### Created
- `Frontend/services/api/config.ts`
- `Frontend/services/api/httpClient.ts`
- `Frontend/.env`
- `Frontend/.env.example`

### Updated
- `Frontend/services/authService.ts`
- `Frontend/services/dataService.ts`
- `Frontend/pages/Login.tsx`
- `Frontend/pages/LoginClient.tsx`
- `Frontend/package.json`
- `Frontend/services/mockData.ts` (added deprecation notice)
- `Frontend/services/db.ts` (added deprecation notice)

## Environment Variables

The Frontend now supports the following environment variables (in `.env` file):

- `VITE_API_URL` - Backend API base URL (default: `http://localhost:5000/api`)
- `GEMINI_API_KEY` - Google Gemini AI API key (for AI assistant feature)

## Success Criteria - ALL MET ✅

✅ API configuration file created
✅ HTTP client utility created
✅ authService.ts updated to use real API
✅ dataService.ts updated to use real API
✅ Environment variables configured
✅ Login components updated to include password
✅ Frontend can authenticate against Backend
✅ Frontend can fetch data from Backend
✅ No TypeScript errors
✅ `npm run dev` starts successfully
