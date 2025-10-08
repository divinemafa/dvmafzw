# 🚀 Quick Start Guide - Restart Required

## ⚠️ IMPORTANT: Dev Server Must Be Restarted

The `.env.local` file was just created with your Supabase credentials. Next.js loads environment variables at startup, so you need to restart the dev server.

---

## 📋 Steps to Get Running

### **Step 1: Stop Current Server**
In your terminal, press **Ctrl+C** to stop the current dev server.

### **Step 2: Restart Dev Server**
```powershell
npm run dev
```

### **Step 3: Verify No Errors**
You should see:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

**No more 500 errors!** ✅

---

## 🧪 Test the New Authentication

### **Test 1: Visit Login Page**
```
http://localhost:3000/auth/login
```
✅ Should load without errors  
✅ Shows email + password form  
✅ Has link to registration  

### **Test 2: Try Dashboard Without Login**
```
http://localhost:3000/dashboard
```
✅ Should redirect to /auth/login  
✅ Shows "you must log in" behavior  

### **Test 3: Try Registration**
```
http://localhost:3000/auth/register
```
✅ Should load registration form  
✅ Has user type selection  
✅ Shows email (required) and phone (optional)  

---

## 🗄️ Database Setup (Still Required)

After the server restarts successfully, you need to run the database migrations:

### **Method: Supabase Dashboard**
1. Go to: https://app.supabase.com/project/swemmmqiaieanqliagkd/sql
2. Open file: `supabase/migrations/20251007100001_create_auth_triggers.sql`
3. Copy all contents (350+ lines)
4. Paste into SQL Editor
5. Click **"Run"**
6. Should see: "Success. No rows returned"

This creates 6 database triggers that auto-create profiles, verification records, and settings when users register.

---

## 🎯 What's Now Working

### **After Server Restart:**
✅ Login page loads (`/auth/login`)  
✅ Registration page loads (`/auth/register`)  
✅ Dashboard redirects if not logged in  
✅ No more 500 errors  
✅ Environment variables loaded  

### **After Database Migration:**
✅ User registration creates database records  
✅ Profiles auto-created on signup  
✅ Verification tracking works  
✅ Settings auto-created  
✅ Email verification updates status  

---

## 🔍 Common Issues

### **Issue 1: Still Getting 500 Error**
**Cause**: Server not restarted  
**Fix**: Make sure you stopped (Ctrl+C) and restarted (npm run dev)

### **Issue 2: "Missing Supabase environment variables"**
**Cause**: .env.local doesn't exist or server not restarted  
**Fix**: 
1. Check file exists: `Test-Path .env.local` should return `True`
2. Restart server: `npm run dev`

### **Issue 3: Login says "Invalid credentials"**
**Cause**: User doesn't exist yet (no account created)  
**Fix**: 
1. Go to `/auth/register` first
2. Create an account
3. Verify email
4. Then try logging in

### **Issue 4: Registration doesn't create account**
**Cause**: Database triggers not run yet  
**Fix**: Run the migration SQL in Supabase dashboard (see above)

---

## 📊 Current System Status

| Component | Status | Notes |
|-----------|--------|-------|
| **.env.local** | ✅ Created | Has Supabase credentials |
| **Login Page** | ✅ Built | `/auth/login` ready |
| **Register Page** | ✅ Built | `/auth/register` ready |
| **Dashboard Protection** | ✅ Built | Redirects if not auth'd |
| **Demo Code** | ✅ Removed | LoginScreen deleted |
| **Dev Server** | ⏳ Needs Restart | Stop and restart required |
| **Database Triggers** | ⏳ Not Run | User needs to execute SQL |
| **Email Verification** | ⏳ Callback Needed | Build next |

---

## 🎉 Success Indicators

After restart, you should be able to:
1. ✅ Visit http://localhost:3000 without 500 error
2. ✅ Navigate to `/auth/login` and see login form
3. ✅ Navigate to `/auth/register` and see registration form
4. ✅ Visit `/dashboard` and get redirected to login
5. ✅ See proper error messages (not "undefined" or crashes)

---

## 📞 Next Steps After Restart

1. **Test the pages** (login, register, dashboard redirect)
2. **Run database migrations** (SQL in Supabase dashboard)
3. **Create a test account** (via registration)
4. **Verify email** (check inbox for Supabase email)
5. **Test login** (with verified account)
6. **Access dashboard** (should work after login)

---

**Ready?** Stop your server (Ctrl+C) and run `npm run dev`! 🚀
