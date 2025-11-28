# API Client Service

This directory contains the API client service that connects the frontend to the Monetaris backend API.

## Files

- **config.ts** - API endpoint configuration
- **apiClient.ts** - Main API client with all domain API functions

## Configuration

Set the API base URL in `.env`:

```env
VITE_API_URL=http://localhost:5033/api
```

## Usage Examples

### Authentication

```typescript
import { authApi } from '@/services/api/apiClient';

// Login
const { token, user } = await authApi.login({
  email: 'admin@monetaris.de',
  password: 'password123'
});

// Store token
localStorage.setItem('monetaris_token', token);
localStorage.setItem('monetaris_user', JSON.stringify(user));

// Debtor login
const { token, user } = await authApi.loginDebtor({
  caseNumber: 'INV-2024-001',
  zipCode: '10115'
});

// Get current user
const user = await authApi.me();

// Logout
await authApi.logout();
```

### Dashboard

```typescript
import { dashboardApi } from '@/services/api/apiClient';

// Get statistics
const stats = await dashboardApi.getStats();
console.log(stats.totalVolume, stats.activeCases);

// Get recent activity
const activity = await dashboardApi.getRecentActivity();

// Global search
const results = await dashboardApi.search('Schmidt');
```

### Debtors

```typescript
import { debtorsApi } from '@/services/api/apiClient';

// Get all debtors with filters
const { data, total } = await debtorsApi.getAll({
  page: 1,
  pageSize: 20,
  tenantId: 'tenant-123',
  search: 'Schmidt'
});

// Get single debtor
const debtor = await debtorsApi.getById('debtor-123');

// Create debtor
const newDebtor = await debtorsApi.create({
  tenantId: 'tenant-123',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@example.com',
  // ... other fields
});

// Update debtor
const updated = await debtorsApi.update('debtor-123', {
  email: 'newemail@example.com'
});

// Delete debtor
await debtorsApi.delete('debtor-123');
```

### Cases

```typescript
import { casesApi } from '@/services/api/apiClient';
import { CaseStatus } from '@/types';

// Get all cases with filters
const { data, total } = await casesApi.getAll({
  status: CaseStatus.NEW,
  tenantId: 'tenant-123'
});

// Get single case
const case = await casesApi.getById('case-123');

// Create case
const newCase = await casesApi.create({
  tenantId: 'tenant-123',
  debtorId: 'debtor-123',
  principalAmount: 1500.00,
  invoiceNumber: 'INV-2024-001',
  // ... other fields
});

// Update case
const updated = await casesApi.update('case-123', {
  principalAmount: 1600.00
});

// Advance workflow
const advanced = await casesApi.advanceWorkflow(
  'case-123',
  CaseStatus.REMINDER_1,
  'Erste Mahnung versendet'
);

// Get case history
const history = await casesApi.getHistory('case-123');
```

### Tenants

```typescript
import { tenantsApi } from '@/services/api/apiClient';

// Get all tenants
const { data, total } = await tenantsApi.getAll();

// Get single tenant
const tenant = await tenantsApi.getById('tenant-123');

// Create tenant
const newTenant = await tenantsApi.create({
  name: 'Acme Corp',
  registrationNumber: 'HRB 12345',
  contactEmail: 'info@acme.com',
  bankAccountIBAN: 'DE89 3704 0044 0532 0130 00'
});

// Update tenant
const updated = await tenantsApi.update('tenant-123', {
  contactEmail: 'new@acme.com'
});
```

### Templates

```typescript
import { templatesApi } from '@/services/api/apiClient';

// Get all templates
const { data, total } = await templatesApi.getAll({
  category: 'REMINDER'
});

// Get single template
const template = await templatesApi.getById('template-123');

// Create template
const newTemplate = await templatesApi.create({
  name: 'Erste Mahnung',
  type: 'EMAIL',
  category: 'REMINDER',
  subject: 'Zahlungserinnerung',
  content: 'Sehr geehrte/r {{debtor.name}}...'
});

// Update template
const updated = await templatesApi.update('template-123', {
  content: 'Updated content...'
});

// Preview template with variables
const preview = await templatesApi.preview('template-123', {
  debtor: { name: 'Max Mustermann' },
  case: { invoiceNumber: 'INV-001' }
});
```

### Documents

```typescript
import { documentsApi } from '@/services/api/apiClient';

// Get all documents
const { data, total } = await documentsApi.getAll({
  debtorId: 'debtor-123'
});

// Upload document
const file = document.getElementById('fileInput').files[0];
const uploaded = await documentsApi.upload(file, {
  debtorId: 'debtor-123',
  caseId: 'case-123'
});

// Get document URL for download
const downloadUrl = documentsApi.download('document-123');
window.open(downloadUrl, '_blank');

// Delete document
await documentsApi.delete('document-123');
```

### Inquiries

```typescript
import { inquiriesApi } from '@/services/api/apiClient';

// Get all inquiries
const { data, total } = await inquiriesApi.getAll({
  status: 'OPEN'
});

// Create inquiry
const inquiry = await inquiriesApi.create({
  caseId: 'case-123',
  caseNumber: 'INV-001',
  question: 'Kann ich in Raten zahlen?'
});

// Resolve inquiry
const resolved = await inquiriesApi.resolve('inquiry-123', 'Ja, Ratenzahlung ist möglich...');
```

### Error Handling

```typescript
import { debtorsApi, type ApiError } from '@/services/api/apiClient';

try {
  const debtor = await debtorsApi.getById('invalid-id');
} catch (error) {
  const apiError = error as ApiError;

  if (apiError.statusCode === 404) {
    console.error('Debtor not found');
  } else if (apiError.statusCode === 401) {
    console.error('Not authenticated - redirected to login');
  } else {
    console.error('API Error:', apiError.message);
    if (apiError.errors) {
      console.error('Validation errors:', apiError.errors);
    }
  }
}
```

## Features

### Automatic Token Management

The API client automatically:
- Attaches JWT token from localStorage to all requests
- Clears session and redirects to login on 401 errors
- Handles token refresh (if configured)

### Type Safety

All API functions are fully typed with TypeScript interfaces from `types.ts`.

### Error Handling

- Network errors are caught and wrapped in `ApiError` objects
- 401 errors automatically clear session and redirect to login
- Validation errors include field-level error details

### Query String Building

Filter objects are automatically converted to URL query strings:

```typescript
await casesApi.getAll({
  status: 'NEW',
  tenantId: 'tenant-123',
  page: 1,
  pageSize: 20
});
// Calls: /api/cases?status=NEW&tenantId=tenant-123&page=1&pageSize=20
```

## Migration from Mock Service

To migrate from the mock `dataService.ts` to the real API client:

1. Replace imports:
   ```typescript
   // Old
   import { dataService } from '@/services/dataService';

   // New
   import { casesApi, debtorsApi } from '@/services/api/apiClient';
   ```

2. Update method calls:
   ```typescript
   // Old
   const cases = await dataService.getAccessibleCases(user);

   // New
   const { data: cases } = await casesApi.getAll();
   ```

3. Handle pagination:
   ```typescript
   // Old - returned array
   const cases = await dataService.getAccessibleCases(user);

   // New - returns paginated result
   const { data: cases, total } = await casesApi.getAll({ page: 1, pageSize: 20 });
   ```

4. Update error handling to use `ApiError` type
