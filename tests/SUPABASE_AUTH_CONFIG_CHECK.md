# Supabase Auth Configuration Checklist

## Error: "Database error creating new user"
**Error Code**: `unexpected_failure` (500)

## Possible Causes:

### 1. **Email Auth Disabled**
- Go to: Supabase Dashboard → Authentication → Providers
- Check: "Enable Email provider" is turned ON
- Fix: Toggle "Enable Email provider" to ON

### 2. **Confirm Email Required (Blocks Admin Creation)**
- Go to: Supabase Dashboard → Authentication → Settings
- Check: "Enable email confirmations" setting
- Issue: When ON, admin.createUser() with `email_confirm: false` might fail
- Fix: Temporarily disable OR use `email_confirm: true` in code

### 3. **Rate Limiting**
- Go to: Supabase Dashboard → Authentication → Rate Limits
- Check: Not hitting rate limits for anonymous endpoints
- Fix: Check/adjust rate limits

### 4. **Database Trigger Error**
- Issue: handle_new_user() function has incorrect cast
- Line 37: `'pending'::account_status` should work (column type matches)
- Possible: Trigger is throwing error during execution

### 5. **RLS Policy Blocking Insert**
- Issue: Profiles table RLS policy might block trigger INSERT
- Check: Triggers run as SECURITY DEFINER, should bypass RLS
- Fix: Verify no conflicting RLS policies

## Immediate Actions:

1. Check Supabase Dashboard → Authentication → Providers
   - Verify "Email" provider is enabled

2. Check Supabase Dashboard → Authentication → Settings
   - Look for "Email confirmations" setting
   - Try: Disable "Require email confirmation" temporarily

3. Check Supabase Dashboard → Logs → Auth Logs
   - Look for detailed error messages
   - May show exact reason for failure

4. Test direct SQL INSERT (bypass trigger):
   ```sql
   INSERT INTO auth.users (
       instance_id,
       id,
       aud,
       role,
       email,
       encrypted_password,
       email_confirmed_at,
       raw_user_meta_data,
       created_at,
       updated_at
   ) VALUES (
       '00000000-0000-0000-0000-000000000000',
       gen_random_uuid(),
       'authenticated',
       'authenticated',
       'test@example.com',
       crypt('password123', gen_salt('bf')),
       NOW(),
       '{"user_type": "business", "phone_number": "+27123456789"}'::jsonb,
       NOW(),
       NOW()
   );
   ```

## Current Status:
- Service role key: ✅ Valid (JWT format correct)
- Enum values: ✅ service/business/individual added
- Function column: ✅ Fixed (status not account_status)
- display_name: ✅ Nullable
- **Auth Settings**: ❓ Need to verify in dashboard

## Next Steps:
1. User checks Supabase auth settings (above)
2. User shares auth configuration state
3. Adjust code based on configuration requirements
