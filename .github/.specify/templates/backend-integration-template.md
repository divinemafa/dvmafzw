# Backend Integration Spec: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Type**: Backend Integration & Data Wiring

---

## 🔬 **Pre-Implementation Analysis**

**⚠️ THIS SECTION MUST BE COMPLETED BEFORE ANY CODE IS WRITTEN ⚠️**

### 1. Target UI File(s)
- **Primary File**: `[path/to/page-or-component.tsx]`
- **Related Files**: 
  - `[path/to/related-component-1.tsx]`
  - `[path/to/related-component-2.tsx]`

### 2. Relevant Migration Files Analyzed
- [ ] `supabase/migrations/[timestamp]_initial_schema.sql` ✅ Read and understood
- [ ] `supabase/migrations/[timestamp]_schema_updates.sql` ✅ Read and understood
- [ ] `supabase/migrations/[other_relevant].sql` ✅ Read and understood

### 3. Gap Analysis Summary (AI GENERATED)

#### 3.1 Components Identified (Prioritized)
- [ ] **Priority 1**: `Component A` - [Brief description of what it does]
- [ ] **Priority 2**: `Component B` - [Brief description]
- [ ] **Priority 3**: `Component C` - [Brief description]

#### 3.2 Data Requirements vs. Schema Reality

| Component | Data Needed | Current DB State | Gap/Missing |
|-----------|-------------|------------------|-------------|
| Component A | `user.name`, `user.avatar` | ✅ Exists in `profiles` table | None |
| Component B | `listings.status`, `listings.views` | ❌ No `listings` table | **CRITICAL: Must create table** |
| Component C | `bookings.count` | ✅ Exists (can calculate) | Need aggregation query |

#### 3.3 Proposed Schema Changes

**Tables to Create**:
```sql
-- Example: Create new table
CREATE TABLE service_listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tables to Modify**:
```sql
-- Example: Add missing columns to existing table
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN bio TEXT;
```

**Indexes to Add**:
```sql
CREATE INDEX idx_listings_status ON service_listings(status);
CREATE INDEX idx_listings_user_id ON service_listings(user_id);
```

#### 3.4 Required API Endpoints

**Existing Endpoints to Use**:
- `GET /api/user/profile` - Fetch user profile data

**New Endpoints to Create**:
- `GET /api/listings` - Fetch user's listings
  - Query params: `status`, `search`, `limit`, `offset`
  - Returns: `{ listings: Listing[] }`
- `POST /api/listings` - Create new listing
  - Body: `{ title, category, price, currency_id }`
  - Returns: `{ listing: Listing }`
- `PATCH /api/listings/[id]` - Update listing
  - Body: `{ [field]: value }`
  - Returns: `{ listing: Listing }`

#### 3.5 Component Implementation Order

**Phase 1 (Week 1)**: Component A
- Why first: Simple, no schema changes needed, builds foundation

**Phase 2 (Week 1-2)**: Component B
- Why second: Requires new table, most critical for user experience

**Phase 3 (Week 2)**: Component C
- Why third: Depends on data from Phase 2

### 4. Analysis Approval

- [ ] **User has reviewed this analysis**
- [ ] **Schema changes approved**
- [ ] **API endpoint design approved**
- [ ] **Component priority confirmed**
- [ ] **Ready to proceed with Phase 1 implementation**

**⚠️ DO NOT PROCEED TO IMPLEMENTATION UNTIL ALL CHECKBOXES ARE CHECKED ⚠️**

---

## 🎯 Integration Objectives

### Current State (UI Mock)
- **Component Location**: `[path/to/component.tsx]`
- **Mock Data Used**: 
  - [ ] Hardcoded arrays
  - [ ] Placeholder constants
  - [ ] Demo functions
  - [ ] Static calculations
- **Lines of Code**: [XXX lines]
- **Key Features Displayed**:
  1. [Feature 1 - e.g., "User stats display"]
  2. [Feature 2 - e.g., "Listing filters"]
  3. [Feature 3 - e.g., "Sort functionality"]

### Target State (Production)
- **Data Source**: [API endpoint / Database table / Real-time service]
- **Backend Dependencies**:
  - API Routes: `[/api/route1, /api/route2]`
  - Database Tables: `[table1, table2]`
  - External Services: `[service1, service2]`
- **Algorithms Required**:
  - [ ] Calculations (describe)
  - [ ] Filters (describe)
  - [ ] Sorting (describe)
  - [ ] Validations (describe)

---

## 📊 Data Mapping

### 1. Data Points Needed
List every piece of data currently shown in UI:

| UI Field | Current Mock Value | Real Data Source | Data Type | Required Algorithm |
|----------|-------------------|------------------|-----------|-------------------|
| [field1] | [mock value] | [table.column / API] | [string/number/date] | [yes/no - describe] |
| [field2] | [mock value] | [table.column / API] | [string/number/date] | [yes/no - describe] |

### 2. Missing Database Fields
If database schema needs updates:

**Tables to Modify**:
- `[table_name]`: Add columns `[column1, column2, column3]`
- `[table_name]`: Modify column `[existing_column]` (reason)

**Migration Strategy**:
- [ ] Update existing migration file: `[filename.sql]`
- [ ] Create schema update file: `[YYYYMMDD_schema_updates.sql]` (only if absolutely necessary)

### 3. API Endpoints Required

**Existing Endpoints to Use**:
- `GET /api/[endpoint]` - [purpose]
- `POST /api/[endpoint]` - [purpose]

**New Endpoints to Create**:
- `GET /api/[endpoint]` - [purpose, parameters, response shape]
- `POST /api/[endpoint]` - [purpose, body schema, response]

---

## ⚙️ Algorithm Specifications

### Algorithm 1: [Name - e.g., "Calculate verification level"]
**Purpose**: [What it does]  
**Input**: [Data required]  
**Output**: [Result format]  
**Logic**:
```
1. [Step 1]
2. [Step 2]
3. [Step 3]
```
**Edge Cases**:
- [Case 1 and handling]
- [Case 2 and handling]

### Algorithm 2: [Name - e.g., "Filter listings by status"]
**Purpose**: [What it does]  
**Input**: [Data required]  
**Output**: [Result format]  
**Logic**: [Describe]

---

## 🔧 Refactoring Plan

### Current File Structure
```
[component.tsx] (XXX lines)
  - UI rendering
  - Mock data
  - Event handlers
  - Constants
```

### Target File Structure
```
component/
  ├── [Component].tsx (< 500 lines - UI only)
  ├── hooks/
  │   ├── use[Component]Data.ts (data fetching)
  │   └── use[Component]Filters.ts (filter logic)
  ├── utils/
  │   ├── [component]Calculations.ts (algorithms)
  │   └── [component]Helpers.ts (utilities)
  ├── types.ts (TypeScript interfaces)
  └── constants.ts (static values)
```

### Files to Create
1. **`hooks/use[Component]Data.ts`** - Fetch real data from API
2. **`utils/[component]Calculations.ts`** - All business logic algorithms
3. **`types.ts`** - Type definitions matching database schema

### Code to Remove
- [ ] All mock data arrays (line XXX-XXX)
- [ ] Placeholder functions (line XXX-XXX)
- [ ] Demo components (line XXX-XXX)
- [ ] Hardcoded calculations (line XXX-XXX)

---

## ✅ Implementation Checklist

### Phase 1: Backend Setup
- [ ] Verify database schema has all required fields
- [ ] Update migration files if needed
- [ ] Create/verify API routes exist
- [ ] Test API endpoints with Postman/Thunder Client

### Phase 2: Data Layer
- [ ] Create data fetching hooks
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test with real database queries

### Phase 3: Business Logic
- [ ] Implement Algorithm 1: [name]
- [ ] Implement Algorithm 2: [name]
- [ ] Add unit tests for each algorithm
- [ ] Validate edge cases

### Phase 4: UI Integration
- [ ] Replace mock data with real data hooks
- [ ] Wire event handlers to API calls
- [ ] Update TypeScript types
- [ ] Remove all placeholder/demo code

### Phase 5: Refactoring
- [ ] Extract reusable logic to utils
- [ ] Break component into smaller files
- [ ] Move constants to separate file
- [ ] Verify file size < 700 lines per file

### Phase 6: Testing & Validation
- [ ] Test all user flows with real data
- [ ] Verify calculations are correct
- [ ] Check error handling works
- [ ] Confirm no console errors
- [ ] Performance check (< 200ms API response)

---

## 🚨 Questions & Blockers

### Clarifications Needed
- [ ] [Question 1 about data structure]
- [ ] [Question 2 about business logic]
- [ ] [Question 3 about API design]

### Dependencies
- [ ] Waiting on: [dependency 1]
- [ ] Blocked by: [blocker 1]

---

## 📝 Notes
- [Any additional context]
- [Related features to consider]
- [Technical debt to address]

---

**Last Updated**: [DATE]  
**Assigned To**: [Developer/AI Agent]  
**Estimated Effort**: [Small/Medium/Large]
