# Test Files

This folder contains SQL and JavaScript test files for the BMC platform.

## SQL Tests (tests/sql/)

Run these using PgSQL MCP or directly in Azure Data Studio:

### Quick Verification
- **`FINAL_VERIFICATION_TEST.sql`** - Run all checks to verify registration is working
- **`test_user_registration.sql`** - Comprehensive registration flow tests

### Specific Issue Tests
- **`test_trigger_function_fix.sql`** - Verify trigger function column names
- Test files for specific database components

### Documentation
All `*.txt` files in `tests/sql/` explain fixes applied:
- `DISPLAY_NAME_FIX.txt` - Latest fix for display_name column
- `SERVICE_ROLE_KEY_FIX.txt` - Service role key typo fix
- `API_ROUTE_FIX.txt` - Why we use API routes
- And more...

## JavaScript Tests (tests/)

Run these with Node.js:

### API Test
```bash
node tests/test-signup-api.js
```
Tests the `/api/auth/signup` endpoint directly.

### Database Test
```bash
node tests/test-database.js
```
Tests database connection and trigger execution.

**Requirements**: 
```bash
pnpm add -D node-fetch@2 dotenv
```

## Test Results Location

All test results are saved in `tests/sql/` with `*_RESULTS.txt` suffix:
- `FINAL_TEST_RESULTS.txt`
- `test_results_user_registration.txt`

## All Fixes Applied

1. ✅ Added user_type enum values: service, business, individual
2. ✅ Fixed handle_new_user() column: account_status → status  
3. ✅ Fixed service role key typo: yeyJ → eyJ
4. ✅ Made display_name column nullable

## Quick Test Procedure

1. Run SQL verification:
   ```sql
   -- In Azure Data Studio or PgSQL MCP
   \i tests/sql/FINAL_VERIFICATION_TEST.sql
   ```

2. Test registration:
   - Go to http://localhost:3000/auth/register
   - Fill form and submit
   - Should see "Check Your Email" page

3. Verify in database:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```

All tests should pass and registration should work! 🎉
