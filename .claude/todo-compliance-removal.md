# Todo: Remove Compliance & Consolidate Tenant/Kreditor References

## Task 1: Remove Compliance Page
- [ ] Delete `Frontend/pages/Compliance.tsx`
- [ ] Remove `/compliance` route from `Frontend/App.tsx`
- [ ] Remove Compliance nav item from `Frontend/components/layout/AppSidebar.tsx`

## Task 2: Consolidate Tenant → Kreditor in Tenants.tsx
- [ ] Update `Frontend/pages/Tenants.tsx` to use `kreditorenApi` instead of `tenantsApi`
- [ ] Update variable names: `tenants` → `kreditoren`, `tenant` → `kreditor`
- [ ] Keep German UI labels as "Mandant" (correct business terminology)
- [ ] Ensure navigation to `/clients/:id` works (not `/tenants/:id`)

## Task 3: Fix dataService.ts API References
- [ ] Update `getTenants()` to use `API_ENDPOINTS.KREDITOREN`
- [ ] Update `getTenantById()` to use consistent kreditor terminology
- [ ] Update `addTenant()` to use `API_ENDPOINTS.KREDITOREN`
- [ ] Keep method names or alias for backward compatibility

## Task 4: Verify Navigation Consistency
- [ ] Ensure AppSidebar "Mandanten" link points to `/clients`
- [ ] Verify no duplicate routes exist (`/tenants` vs `/clients`)
- [ ] Ensure Tenants.tsx navigates to `/clients/:id` not `/tenants/:id`

## Notes:
- Backend already uses Kreditor consistently
- UI can keep "Mandant" as German business term
- Technical code should use `kreditor` not `tenant`
- Route should be `/clients` (not `/tenants`)
