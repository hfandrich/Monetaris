# Frontend-Backend Integration Testing Guide

## Prerequisites

1. Backend is running on `http://localhost:5000`
2. Frontend is running on `http://localhost:3000`
3. Backend database is seeded with test users

## Test User Credentials

Based on the previous mock data structure, you should have these users in your Backend:

### Admin User
- **Email**: `admin@monetaris.com`
- **Password**: `password`
- **Role**: ADMIN
- **Access**: Full system access

### Agent User
- **Email**: `agent@monetaris.com`
- **Password**: `password`
- **Role**: AGENT
- **Access**: Assigned tenants only

### Client User
- **Email**: `client@techsolutions.de`
- **Password**: `password`
- **Role**: CLIENT
- **Access**: Single tenant (their own)

### Debtor Access
- **Login Method**: Case number + ZIP code
- **Example Case Number**: From your Backend data
- **Example ZIP**: Matching debtor's ZIP code

## Testing Checklist

### 1. Authentication Tests

#### Standard Login (Admin/Agent/Client)
1. Navigate to `http://localhost:3000/#/login`
2. Enter email: `admin@monetaris.com`
3. Enter password: `password`
4. Click "Authentifizieren"
5. ✅ Should redirect to dashboard
6. ✅ Check browser DevTools Network tab for:
   - POST request to `http://localhost:5000/api/auth/login`
   - Response contains `accessToken`, `refreshToken`, `user`
7. ✅ Check localStorage:
   - `monetaris_token` - contains JWT
   - `monetaris_refresh_token` - contains refresh token
   - `monetaris_user` - contains user JSON

#### Client Login
1. Navigate to `http://localhost:3000/#/client-login`
2. Enter client email
3. Enter password
4. ✅ Should redirect to client portal
5. ✅ Should only see client's own data

#### Debtor Login
1. Navigate to `http://localhost:3000/#/resolve`
2. Enter case number (invoice number)
3. Enter ZIP code
4. ✅ Should redirect to debtor portal
5. ✅ Should only see their own case(s)

### 2. Dashboard Tests

1. Login as Admin
2. Navigate to Dashboard
3. ✅ Check DevTools Network tab for:
   - GET `http://localhost:5000/api/dashboard/stats`
   - Response contains statistics (totalVolume, activeCases, etc.)
4. ✅ Dashboard widgets display data correctly
5. ✅ Charts render with real data

### 3. Cases (Forderungen) Tests

1. Navigate to Claims/Cases page
2. ✅ Check DevTools Network tab for:
   - GET `http://localhost:5000/api/cases`
   - Authorization header includes Bearer token
3. ✅ Cases list displays
4. ✅ Click on a case to view details
5. ✅ Try advancing workflow status
   - Should POST to `/api/cases/{id}/advance`

### 4. Debtors (Schuldner) Tests

1. Navigate to Debtors page
2. ✅ Check DevTools Network tab for:
   - GET `http://localhost:5000/api/debtors`
3. ✅ Debtors list displays
4. ✅ Click on a debtor
   - Should GET `/api/debtors/{id}`
   - Should GET `/api/debtors/{id}/cases`
5. ✅ View debtor details and related cases

### 5. Tenants (Mandanten) Tests

1. Navigate to Clients/Tenants page (Admin only)
2. ✅ Check DevTools Network tab for:
   - GET `http://localhost:5000/api/tenants`
3. ✅ Tenants list displays
4. ✅ Click on a tenant
   - Should GET `/api/tenants/{id}`
   - Should GET `/api/tenants/{id}/cases`
   - Should GET `/api/tenants/{id}/users`

### 6. Search Tests

1. Use global search (top header)
2. Type a search query
3. ✅ Check DevTools Network tab for:
   - GET `http://localhost:5000/api/search?q={query}`
4. ✅ Search results display
5. ✅ Click on result navigates to correct page

### 7. Templates Tests

1. Navigate to Templates page
2. ✅ Check DevTools Network tab for:
   - GET `http://localhost:5000/api/templates`
3. ✅ Templates list displays
4. ✅ Try creating a new template
   - Should POST to `/api/templates`
5. ✅ Try editing a template
   - Should PUT to `/api/templates/{id}`

### 8. Role-Based Access Control Tests

#### As Admin
- ✅ Can see all tenants
- ✅ Can see all cases
- ✅ Can see all debtors
- ✅ Has access to all menu items

#### As Agent
- ✅ Can only see assigned tenants
- ✅ Can only see cases from assigned tenants
- ✅ Can only see debtors from assigned tenants
- ✅ No access to system settings

#### As Client
- ✅ Can only see own tenant
- ✅ Can only see own cases
- ✅ Can only see own debtors
- ✅ Limited menu options

#### As Debtor
- ✅ Can only see own case(s)
- ✅ Can view case details
- ✅ Can make payment
- ✅ Very limited access

### 9. Error Handling Tests

#### Invalid Credentials
1. Login with wrong email/password
2. ✅ Should show error message
3. ✅ Should not redirect
4. ✅ Should not store token

#### Network Error
1. Stop Backend server
2. Try to login
3. ✅ Should show error message
4. ✅ Should handle gracefully

#### Expired Token
1. Login successfully
2. Manually delete `monetaris_token` from localStorage
3. Try to navigate to protected page
4. ✅ Should redirect to login
5. ✅ Or show error and prompt re-login

### 10. Logout Test

1. Login successfully
2. Click logout button
3. ✅ Check DevTools Network tab for:
   - POST `http://localhost:5000/api/auth/logout`
   - Request includes refreshToken
4. ✅ localStorage cleared:
   - `monetaris_token` removed
   - `monetaris_refresh_token` removed
   - `monetaris_user` removed
5. ✅ Redirected to login page

## Common Issues and Solutions

### Issue: CORS Errors
**Symptom**: Browser console shows CORS policy errors
**Solution**: Backend needs CORS configuration for `http://localhost:3000`

### Issue: 401 Unauthorized
**Symptom**: All API calls return 401
**Solution**:
1. Check token is stored in localStorage
2. Check Authorization header is included
3. Verify token is valid (not expired)

### Issue: Empty Data
**Symptom**: Pages load but show no data
**Solution**: Backend database needs to be seeded with test data

### Issue: Connection Refused
**Symptom**: Network error, cannot reach server
**Solution**:
1. Verify Backend is running on port 5000
2. Check `VITE_API_URL` in `.env` file
3. Ensure no firewall blocking

## Browser DevTools Tips

### Network Tab
- Filter by "Fetch/XHR" to see API calls only
- Check Status codes (200 = success, 401 = unauthorized, etc.)
- View Request headers (Authorization header)
- View Response data

### Console Tab
- Look for JavaScript errors
- Network errors will show here

### Application Tab (localStorage)
- Check stored tokens and user data
- Manually clear if needed for testing

## Success Indicators

✅ **All API calls return 200 status**
✅ **Authorization headers present on protected endpoints**
✅ **Data displays correctly in UI**
✅ **Role-based filtering works**
✅ **Login/logout flow works**
✅ **No console errors**
✅ **No TypeScript compilation errors**

## Quick Test Script

```bash
# Terminal 1 - Start Backend
cd Backend
dotnet run

# Terminal 2 - Start Frontend
cd Frontend
npm run dev

# Browser
# Navigate to http://localhost:3000
# Login with admin@monetaris.com / password
# Check dashboard loads
# Check cases list loads
# Check debtors list loads
# Test search
# Logout
# ✅ All working!
```
