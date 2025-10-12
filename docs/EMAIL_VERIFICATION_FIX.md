# Email Verification Link Fix

**Issue**: Email verification links point to `localhost:3000` instead of production domain.

**Root Cause**: Missing `NEXT_PUBLIC_SITE_URL` environment variable in Vercel.

---

## ✅ Solution: Add Environment Variable

### Step 1: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://www.bitcoinmascot.com
   ```
6. Select environments: **Production**, **Preview**, **Development**
7. Click **Save**

### Step 2: Redeploy
1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 🧪 Test the Fix

After redeployment:

1. **Register a new test user** at https://www.bitcoinmascot.com/auth/register
2. **Check your email** - the verification link should now point to:
   ```
   https://www.bitcoinmascot.com/auth/callback?...
   ```
   Instead of:
   ```
   http://localhost:3000/auth/callback?...
   ```

---

## 📝 Related Files

- **API Route**: `app/api/auth/signup/route.ts` (line 80)
  ```typescript
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ```

- **Environment Example**: `.env.production.example`
  - Updated to include `NEXT_PUBLIC_SITE_URL`

---

## 🔧 Additional Configuration (Optional)

You can also configure the email template in Supabase:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Edit the **"Confirm signup"** template
3. Verify it uses the correct `{{ .ConfirmationURL }}` variable

---

## ✅ Verification Checklist

- [ ] `NEXT_PUBLIC_SITE_URL` added to Vercel environment variables
- [ ] Redeployed application
- [ ] Tested signup with real email
- [ ] Verified email link points to production domain
- [ ] Clicked link and confirmed it redirects correctly

---

**Status**: 🔧 **Action Required** - Add environment variable to Vercel

**Updated**: October 12, 2025
