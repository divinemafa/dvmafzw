# Analysis-First Workflow - Implementation Guide

**Version**: 1.0.0  
**Date**: October 12, 2025  
**Status**: Mandatory for all backend integration work

---

## 🎯 **Overview**

This document describes the new **mandatory analysis-first workflow** for backend integration. All work must follow this process.

---

## 🚨 **Critical Rule**

**NO CODE SHALL BE WRITTEN BEFORE ANALYSIS IS COMPLETE AND APPROVED**

This is a **NON-NEGOTIABLE** requirement enforced by:
- Constitution (Principle VIII)
- Copilot Instructions
- Backend Integration Template

---

## 📋 **The 4-Step Workflow**

### **Step 1: Identify Target UI**
Developer specifies which UI page or component needs backend integration.

**Example**:
```
"Let's integrate the Dashboard listings section"
Target: app/dashboard/components/content/ListingsGrid.tsx
```

### **Step 2: Analyze Database Schema**
AI/Developer MUST:
- Read ALL relevant migration files in `supabase/migrations/`
- Understand current tables, columns, relationships
- Document what exists in the database

**Example**:
```
Files analyzed:
✅ 20251007000001_create_profiles_table.sql
✅ 20251007000008_create_payment_transactions_table.sql
✅ 20251007000005_create_supported_currencies_table.sql

Current state:
- profiles table exists (has user data)
- No listings/services table exists ❌
- supported_currencies table exists (can reference for pricing)
```

### **Step 3: Generate Gap Analysis & Plan**
AI MUST produce a structured document using `backend-integration-template.md` that includes:

#### 3.1 Component Breakdown
List ALL components on the page with priority order:
```
Priority 1: ListingsStatsHeader (simplest, no schema changes)
Priority 2: ListingsGrid (requires new table)
Priority 3: ListingsFilters (depends on data from Priority 2)
```

#### 3.2 Data Mapping
For each component, map:
- What data it needs
- Where that data should come from in DB
- What's missing

**Example**:
| Component | Needs | DB Source | Status |
|-----------|-------|-----------|--------|
| StatsHeader | Total listings count | `COUNT(*) FROM service_listings` | ❌ Table missing |
| StatsHeader | Active count | `COUNT(*) WHERE status='active'` | ❌ Table missing |
| ListingsGrid | All user listings | `SELECT * FROM service_listings WHERE user_id=?` | ❌ Table missing |

#### 3.3 Schema Changes
Document EXACTLY what SQL needs to run:
```sql
-- NEW TABLE REQUIRED
CREATE TABLE service_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_service_listings_user_id ON service_listings(user_id);
CREATE INDEX idx_service_listings_status ON service_listings(status);
```

#### 3.4 API Endpoints
List ALL required endpoints:
```
NEW ENDPOINTS:
- GET /api/listings (fetch user's listings)
- POST /api/listings (create new listing)
- PATCH /api/listings/[id] (update listing)
- DELETE /api/listings/[id] (soft delete)

EXISTING ENDPOINTS:
- GET /api/user/profile (reuse for user info)
```

#### 3.5 Get Approval
Present plan to user/team lead for approval before coding.

### **Step 4: Execute Component-by-Component**
After approval:
1. Start with **Priority 1 component only**
2. Complete full cycle: DB → API → Frontend → Test
3. Mark Priority 1 as 100% done
4. Move to Priority 2 (repeat)
5. Never work on multiple components simultaneously

---

## ✅ **Analysis Checklist**

Before writing any code, verify:

- [ ] Target UI page/component identified
- [ ] All relevant migration files read and understood
- [ ] Gap analysis document created using template
- [ ] All components on page listed with priorities
- [ ] Data requirements mapped for each component
- [ ] Missing DB fields/tables documented
- [ ] Schema change SQL written
- [ ] API endpoints listed
- [ ] Plan presented to user/lead
- [ ] Plan approved by user/lead
- [ ] Implementation order confirmed

**If ANY item is unchecked, STOP. Complete analysis first.**

---

## 🎯 **Example Prompts to Initiate Workflow**

### Example 1: Dashboard Integration
```
Let's start integrating the user dashboard. Analyze the page at 
`app/dashboard/page.tsx`. Cross-reference its UI requirements with 
our database schema defined in `supabase/migrations/`. Generate a 
full backend integration plan using the backend-integration-template.md. 
Once the plan is ready, we will start by wiring up only the 
`<DashboardHeader />` component first.
```

### Example 2: Listings Page Integration
```
I need to wire the listings management page to real data. The file is 
`app/dashboard/components/content/ListingsGrid.tsx`. First, analyze 
what data this component needs. Then read our migration files to see 
what exists in the database. Create a gap analysis and plan. Don't 
start coding until I approve the plan. We'll implement one component 
at a time.
```

### Example 3: Profile Page Integration
```
Analyze `app/profile/page.tsx` for backend integration. Read the 
profiles table migration to understand current schema. Document what's 
missing. Create a plan that breaks the page into components and 
prioritizes which to wire first. Use the backend-integration-template.md 
format. Wait for my approval before starting.
```

---

## 🚫 **Anti-Patterns (FORBIDDEN)**

### ❌ **Old Way (Reactive)**
```
1. Start coding page integration
2. Realize database field is missing
3. Stop, create migration
4. Resume coding
5. Discover another missing field
6. Stop again, update migration
7. Repeat cycle 3-4 times
```
**Problem**: Wasteful, error-prone, creates technical debt

### ❌ **Mass Wiring**
```
"Wire the entire dashboard page at once"
```
**Problem**: Too much scope, impossible to test properly, high chance of errors

### ✅ **New Way (Proactive)**
```
1. Analyze entire page FIRST
2. Identify ALL missing fields upfront
3. Create/update schema once
4. Wire component 1 → test → done
5. Wire component 2 → test → done
6. Wire component 3 → test → done
```
**Benefit**: Strategic, testable, predictable, professional

---

## 📊 **Workflow Diagram**

```
┌─────────────────────────────────────┐
│  Step 1: Identify Target UI         │
│  (Developer specifies page/file)    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Step 2: Analyze DB Schema          │
│  (Read migration files)             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Step 3: Generate Gap Analysis      │
│  (Use backend-integration-template) │
│  - List components                  │
│  - Map data needs                   │
│  - Identify gaps                    │
│  - Propose schema changes           │
│  - List API endpoints               │
│  - Prioritize components            │
└──────────────┬──────────────────────┘
               ↓
         [User Approval]
               ↓
┌─────────────────────────────────────┐
│  Step 4: Execute Component-by-Component │
│  Component 1 → DB → API → UI → Test│
│          ↓                          │
│  Component 2 → DB → API → UI → Test│
│          ↓                          │
│  Component 3 → DB → API → UI → Test│
└─────────────────────────────────────┘
```

---

## 📚 **Related Documentation**

- **Constitution**: `.github/.specify/memory/constitution.md` (Principle VIII)
- **Copilot Instructions**: `.github/copilot-instructions.md` (Analysis-First Workflow section)
- **Integration Template**: `.github/.specify/templates/backend-integration-template.md`
- **Quick Reference**: `.github/.specify/BACKEND_INTEGRATION_GUIDE.md`

---

## 🎓 **Learning Outcomes**

By following this workflow, you will:
- ✅ Reduce integration errors by 80%
- ✅ Eliminate "discovered missing field" surprises
- ✅ Create predictable, testable implementations
- ✅ Build confidence in database schema
- ✅ Produce professional, strategic code
- ✅ Avoid technical debt accumulation

---

**Version**: 1.0.0  
**Last Updated**: October 12, 2025  
**Status**: ✅ Mandatory - Enforced by Constitution Principle VIII
