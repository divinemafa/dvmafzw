# Supabase PostgreSQL Connection Information

## Project Details
- **Project Reference ID:** `swemmmqiaieanqliagkd`
- **Region:** EU Central (Frankfurt) - `aws-1-eu-central-1`

---

## Connection Parameters for PostgreSQL Tools

### 📋 Direct Connection (Transaction Mode)
Use these settings for **pgAdmin**, **DBeaver**, **DataGrip**, or **VS Code PostgreSQL extension**:

```
Host:     aws-1-eu-central-1.pooler.supabase.com
Port:     5432
Database: postgres
Username: postgres.swemmmqiaieanqliagkd
Password: x3qaJYjrh08voto8
```

### SSL Settings
- **SSL Mode:** `require` or `prefer`
- **SSL Certificate:** Not required for Supabase pooler

---

## Connection Strings

### 📌 PostgreSQL Connection String (Pooler - Transaction Mode)
```
postgresql://postgres.swemmmqiaieanqliagkd:x3qaJYjrh08voto8@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

### 📌 PostgreSQL Connection String (Direct - Session Mode)
```
postgresql://postgres.swemmmqiaieanqliagkd:x3qaJYjrh08voto8@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**Ports:**
- **5432** - Transaction mode (pooled, recommended for most use cases)
- **6543** - Session mode (direct, use for migrations or admin tasks)

---

## VS Code PostgreSQL Extension Setup

If you're using the **PostgreSQL extension** in VS Code:

1. **Host:** `aws-1-eu-central-1.pooler.supabase.com`
2. **Port:** `6543` (use session mode for VS Code)
3. **Database:** `postgres`
4. **Username:** `postgres.swemmmqiaieanqliagkd`
5. **Password:** `x3qaJYjrh08voto8`
6. **Use SSL:** ✅ Yes
7. **SSL Mode:** `require`

---

## Troubleshooting Connection Issues

### Issue 1: "getaddrinfo failed" or DNS error
**Solution:** Check your internet connection and firewall settings. Supabase uses AWS endpoints that may be blocked by some networks.

### Issue 2: "password authentication failed"
**Solution:** 
- Double-check the password: `x3qaJYjrh08voto8`
- Ensure you're using the full username: `postgres.swemmmqiaieanqliagkd` (not just `postgres`)

### Issue 3: "connection timeout"
**Solutions:**
1. Try port **6543** instead of **5432** (session mode has better connectivity)
2. Check if your firewall is blocking port 5432/6543
3. Try from a different network (some corporate/school networks block database ports)
4. Use Supabase Studio instead (web-based): https://supabase.com/dashboard/project/swemmmqiaieanqliagkd

### Issue 4: "too many connections"
**Solution:** Use the pooler endpoint (port 5432) instead of direct connection

---

## Alternative: Supabase Studio (Web Interface)

If direct PostgreSQL connection fails, use Supabase Studio:

1. Go to: https://supabase.com/dashboard/project/swemmmqiaieanqliagkd
2. Navigate to: **Table Editor** or **SQL Editor**
3. You can run all migrations directly from the web interface

### Running Migrations via Supabase Studio

1. Open **SQL Editor**: https://supabase.com/dashboard/project/swemmmqiaieanqliagkd/sql/new
2. Copy contents of migration file (e.g., `supabase/migrations/20251007000001_create_profiles_table.sql`)
3. Paste into SQL Editor
4. Click **Run** (▶️)
5. Repeat for each migration file in order (000001 → 000009)

---

## Connection Test

To test your connection from command line:

### Using psql (if installed):
```powershell
psql "postgresql://postgres.swemmmqiaieanqliagkd:x3qaJYjrh08voto8@aws-1-eu-central-1.pooler.supabase.com:6543/postgres"
```

### Using Supabase CLI:
```powershell
supabase db remote list --password x3qaJYjrh08voto8
```

---

## Quick Reference

| Parameter | Value |
|-----------|-------|
| Host | `aws-1-eu-central-1.pooler.supabase.com` |
| Port (Transaction) | `5432` |
| Port (Session) | `6543` |
| Database | `postgres` |
| Username | `postgres.swemmmqiaieanqliagkd` |
| Password | `x3qaJYjrh08voto8` |
| SSL | Required |

---

## Next Steps After Connecting

Once connected, you can:

1. ✅ View the empty database schema
2. ✅ Run migration files to create tables
3. ✅ Browse tables and relationships
4. ✅ Execute queries directly

### Running Migrations Manually

If Supabase CLI doesn't work, you can copy-paste each migration file into your SQL client:

**Order:**
1. `20251007000001_create_profiles_table.sql`
2. `20251007000002_create_user_verification_table.sql`
3. `20251007000003_create_user_wallets_table.sql`
4. `20251007000004_create_user_settings_table.sql`
5. `20251007000005_create_supported_currencies_table.sql`
6. `20251007000006_create_crypto_payment_methods_table.sql`
7. `20251007000007_create_exchange_rates_table.sql`
8. `20251007000008_create_payment_transactions_table.sql`
9. `20251007000009_create_blockchain_confirmations_table.sql`

Each file is fully commented and ready to execute! 🚀

---

**Created:** October 7, 2025  
**Project:** Bitcoin Mascot (BMC) Marketplace  
**Database Version:** Phase 1 & 2 (Authentication + Payment Infrastructure)
