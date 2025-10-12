# GitHub Copilot Instructions - BMC Platform

use these instructions to guide GitHub Copilot in generating high-quality, maintainable code for the Bitcoin Mascot (BMC) platform. The focus is on React with TypeScript, adhering to best practices for component structure, file organization, and coding standards.
first read the constitution in `.github/.specify/memory/constitution.md` for overall project principles.

---

## 🚀 **CURRENT PROJECT PHASE: BACKEND INTEGRATION & DATA WIRING**

**We are now transitioning from UI prototyping to production-ready backend integration.**

### **Phase Objectives:**
1. ✅ **Backend Integration** - Wire APIs to existing UI components
2. ✅ **Data Population** - Replace ALL mock/placeholder data with real database calls
3. ✅ **Algorithm Implementation** - Build business logic (calculations, filters, sorting, validations)
4. ✅ **Code Refactoring** - Break large files into maintainable modules by functionality
5. ✅ **Database Schema Management** - Update existing migration files (avoid creating new ones)
6. ✅ **Production-Ready Code** - Remove all demo/placeholder code during implementation

---

## 🎯 Core Coding Principles
- ✅ **ANALYZE BEFORE YOU WIRE** - Every integration task MUST start with a gap analysis comparing UI needs vs. database schema
- ✅ **COMPONENT-SCOPED INTEGRATION** - Wire ONE component at a time. Do NOT wire an entire page at once
- ✅ **Work on one feature at a time** - Complete backend integration before moving to next feature
- ✅ **REMOVE ALL DEMO/PLACEHOLDER CODE** - Delete mock data, demo components, and placeholder logic as you wire real data
- ✅ **WIRE BACKEND TO FRONTEND** - Connect every UI component to real API endpoints and database queries
- ✅ **BUILD ALGORITHMS IN PLACE** - If a feature needs calculations/logic, implement it immediately (don't skip)
- ✅ **UPDATE EXISTING MIGRATIONS** - Modify original migration files instead of creating new ones (use descriptive suffixes like `_schema_updates.sql` if absolutely necessary)
- ✅ **REFACTOR AS YOU GO** - Break files into smaller modules when wiring backend (don't wait)
- ✅ **NO AUTOMATIC DOCUMENTATION** - This is a strict rule:
  - **NEVER create documentation files automatically**
  - **ONLY create docs when user explicitly asks: "document this" or "create documentation"**
  - **Exception 1**: When user requests a final report after completing a full page/feature
  - **Exception 2**: When user specifically says "analyze and document"
  - When documentation IS requested: place in `/docs`, max 300 words, clear headings, focus on what/why/next steps
  - **Default behavior**: Just code. No docs. No analysis files. No summaries.
- ✅ **Ask clarifying questions** if backend data structure, API endpoints, or business logic is unclear

---

## 🔬 **New Workflow: Analysis-First Backend Integration**

### **Old Workflow (Reactive - DEPRECATED)**
```
❌ Pick a page → Start coding → Discover missing DB fields → Fix schema → Continue coding
```

### **New Workflow (Analysis-First - MANDATORY)**
```
✅ 1. Analyze Target Page → 2. Analyze DB Schema → 3. Generate Gap Analysis & Plan → 4. Execute Component-by-Component
```

### **Detailed Steps:**

#### **Step 1: Analyze the Target Page**
- Developer (or AI) specifies a UI page/file to be integrated
- Example: `app/dashboard/page.tsx` or `app/dashboard/components/content/ListingsGrid.tsx`

#### **Step 2: Analyze the Database Schema**
- AI MUST read existing migration files in `supabase/migrations/`
- Understand current state of database tables, columns, relationships
- Identify what already exists vs. what's missing

#### **Step 3: Generate a Gap Analysis & Plan**
The AI MUST produce a detailed plan that:
- **Lists all components** on the page (break down by functionality)
- **Maps data requirements** for each component (what data does it need?)
- **Identifies missing database fields** required by the UI
- **Proposes schema changes** (ALTER TABLE statements, new tables, indexes)
- **Lists required API endpoints** (GET/POST/PATCH/DELETE)
- **Prioritizes components** (which to wire first, second, third)

**Output Format**: Use `.github/.specify/templates/backend-integration-template.md`

#### **Step 4: Execute Component-by-Component**
- After the plan is approved, work begins on the **FIRST component only**
- Complete implementation: DB changes → API → Frontend → Testing
- Move to next component only when current one is 100% done
- **DO NOT implement the entire plan at once**

---

## 📋 **Analysis Checklist (Required Before Coding)**

Before writing ANY code for backend integration, confirm:

- [ ] **Target page/component identified** - Know exactly what UI needs wiring
- [ ] **All migration files read** - Understand current database schema
- [ ] **Gap analysis completed** - Document what's missing vs. what UI needs
- [ ] **Schema changes documented** - Know which ALTER TABLE statements needed
- [ ] **API endpoints documented** - Know which routes to create
- [ ] **Component priority set** - Know which component to wire first
- [ ] **Plan approved by user** - Don't proceed without confirmation

**If ANY checkbox is unchecked, STOP and complete analysis first.**

### **1. Code Length & File Size**
- ✅ **Recommended file length**: 350-750 lines per component/file
- ✅ **Ideal file length**: 450-600 lines
- ✅ **Page components**: Can go up to 800 lines if necessary
- ⚠️ **Warning threshold**: 600-1000 lines (consider refactoring)
- ❌ **Never exceed**: 1500 lines in a single file
- 🔧 **Action**: If a file exceeds 700 lines and contains multiple distinct features/sections, refactor into smaller components

### **2. Component Structure**
```typescript
// ✅ GOOD: Small, focused component
const UserCard = ({ user }: { user: User }) => (
  <div className="card">
    <Avatar src={user.avatar} />
    <UserInfo user={user} />
  </div>
);

// ❌ BAD: Monolithic component with multiple responsibilities
const Dashboard = () => {
  // 500+ lines of JSX, logic, and data handling
  return <div>...</div>;
};
```

### **3. Component Organization**
```
app/
  dashboard/
    page.tsx                    (< 500 lines - orchestration)
    components/
      DashboardHeader.tsx       (< 200 lines)
      StatsGrid.tsx             (< 300 lines)
      RecentBookings.tsx        (< 400 lines)
      RecentReviews.tsx         (< 300 lines)
      Sidebar.tsx               (< 400 lines)
    hooks/
      useDashboardData.ts       (< 300 lines)
    types.ts                    (< 200 lines)
```

### **4. Separation of Concerns**
- ✅ **Extract data**: Move to hooks or API calls
- ✅ **Extract UI**: Create reusable components
- ✅ **Extract logic**: Create utility functions
- ✅ **Extract types**: Create separate type files
- ✅ **Extract constants**: Create separate constant files
- ✅ **Keep components focused**: Each component should do one thing well

---

## 📦 Component Best Practices

### **Component Size Rules**
1. **Single Responsibility**: Each component does ONE thing well
2. **Prop Drilling Limit**: Maximum 3 levels deep (use Context/Redux beyond)
3. **JSX Complexity**: If JSX is > 100 lines, extract sub-components
4. **State Management**: If > 5 useState hooks, consider useReducer or Zustand

### **When to Extract a Component**
Extract when:
- ✅ Code block is reused 2+ times
- ✅ Component exceeds 500 lines
- ✅ Component has 4+ distinct, unrelated sections
- ✅ Component has deeply nested conditional rendering (3+ levels)
- ✅ Component manages its own state that's completely unrelated to parent
- ✅ A section can logically stand alone as its own feature

### **Naming Conventions**
```typescript
// Components: PascalCase
const DashboardHeader = () => { };

// Hooks: camelCase with "use" prefix
const useDashboardData = () => { };

// Utils: camelCase
const formatCurrency = () => { };

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5000000;

// Types: PascalCase
type UserProfile = { };
```

---

## 🎨 Code Style Guidelines

### **TypeScript**
```typescript
// ✅ ALWAYS use TypeScript
// ✅ ALWAYS define types for props
// ✅ ALWAYS use interfaces for objects with multiple properties
// ✅ AVOID "any" type (use "unknown" if needed)

// ✅ GOOD
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  isLoading?: boolean;
}

// ❌ BAD
const UserCard = (props: any) => { };
```

### **React Best Practices**
```typescript
// ✅ Use functional components (no class components)
// ✅ Use hooks for state and side effects
// ✅ Use memo for expensive renders
// ✅ Use useCallback for functions passed as props
// ✅ Use useMemo for expensive calculations
// ✅ Use comments to explain main logic for complex sections
// ✅ Use descriptive variable names

// ✅ GOOD: Memoized component
const ExpensiveList = memo(({ items }: { items: Item[] }) => {
  return items.map(item => <ItemCard key={item.id} item={item} />);
});

// ✅ GOOD: Optimized callback
const handleClick = useCallback((id: string) => {
  updateItem(id);
}, [updateItem]);
```

### **Import Organization**
```typescript
// 1. React imports
import { useState, useEffect, memo } from 'react';

// 2. Third-party imports
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// 3. Local components
import { Button } from '@/components/ui/Button';
import { UserCard } from './UserCard';

// 4. Hooks
import { useUser } from '@/hooks/useUser';

// 5. Utils & Helpers
import { formatDate } from '@/lib/utils';

// 6. Types
import type { User, Profile } from '@/types';

// 7. Constants
import { API_ENDPOINTS } from '@/constants';
```

---

## 🗂️ File Structure Rules

### **Component File Structure**
```typescript
// 1. Imports (grouped as above)
import { useState } from 'react';
import type { User } from '@/types';

// 2. Types/Interfaces (local to this file)
interface UserCardProps {
  user: User;
}

// 3. Constants (local to this file)
const MAX_BIO_LENGTH = 500;

// 4. Helper functions (local to this file)
const truncateBio = (bio: string) => {
  return bio.length > MAX_BIO_LENGTH 
    ? bio.slice(0, MAX_BIO_LENGTH) + '...' 
    : bio;
};

// 5. Main component
export const UserCard = ({ user }: UserCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

// 6. Sub-components (if small and only used here)
const UserAvatar = ({ src }: { src: string }) => (
  <img src={src} alt="User avatar" />
);
```

### **Directory Structure**
```
app/
  [route]/
    page.tsx                 (Route page - orchestration)
    layout.tsx               (Optional layout)
    loading.tsx              (Loading state)
    error.tsx                (Error boundary)
    components/              (Page-specific components)
      [Component].tsx
    hooks/                   (Page-specific hooks)
      use[Hook].ts
    utils/                   (Page-specific utilities)
      [util].ts
    types.ts                 (Page-specific types)
    constants.ts             (Page-specific constants)
```

---

## 🔧 Refactoring Guidelines

### **When to Refactor**
Refactor when:
1. ✅ File exceeds 800 lines OR has multiple unrelated features
2. ✅ Function exceeds 50 lines (extract helper functions)
3. ✅ Component has 5+ useEffect hooks doing different things
4. ✅ Component has 8+ useState hooks
5. ✅ JSX has 4+ levels of nesting
6. ✅ Code is duplicated 3+ times
7. ✅ Component has unclear name or mixes multiple responsibilities
8. ✅ You need to scroll excessively to understand the code flow

### **Refactoring Steps**
1. **Identify**: Find large files/components (> 500 lines)
2. **Analyze**: Determine logical boundaries (distinct features/sections)
3. **Extract**: Create new files/components only if sections are truly independent
4. **Test**: Ensure functionality unchanged
5. **Cleanup**: Remove unused code
6. **Document**: Add comments for complex logic

### **Example Refactoring**
```typescript
// ❌ BEFORE: 1200-line Dashboard with multiple distinct features
const Dashboard = () => {
  // 100 lines of state for 3 different tabs
  // 150 lines of data fetching
  // 200 lines of helper functions
  // 750 lines of JSX with 3 completely separate tab contents
  return <div>...</div>;
};

// ✅ AFTER: Refactored into logical pieces

// page.tsx (200 lines - orchestration)
const DashboardPage = () => {
  const data = useDashboardData();
  return (
    <DashboardLayout>
      <DashboardHeader stats={data.stats} />
      <DashboardContent listings={data.listings} />
      <DashboardSidebar actions={data.actions} />
    </DashboardLayout>
  );
};

// hooks/useDashboardData.ts (150 lines - all data logic)
export const useDashboardData = () => {
  const [data, setData] = useState(null);
  useEffect(() => { /* fetch data */ }, []);
  return data;
};

// components/DashboardHeader.tsx (100 lines)
export const DashboardHeader = ({ stats }: Props) => {
  return <header>...</header>;
};

// Note: If a 500-line component is cohesive (single feature, logical flow),
// it's BETTER to keep it together than split unnecessarily
```

---

## 📝 Code Quality Checklist

Before committing code, ensure:
- [ ] File is under 500 lines (800 max with good reason, document why)
- [ ] Component has single responsibility (does one thing well)
- [ ] All props have TypeScript types
- [ ] No "any" types used
- [ ] Imports are organized
- [ ] No duplicate code (DRY principle)
- [ ] Complex logic extracted to utils
- [ ] Data fetching extracted to hooks
- [ ] UI components are reusable
- [ ] Constants extracted to separate file
- [ ] Types extracted to separate file
- [ ] Comments added for complex logic
- [ ] No console.log statements
- [ ] ESLint warnings fixed
- [ ] Prettier formatting applied

---

## 🚫 Anti-Patterns to Avoid

### **1. God Components**
```typescript
// ❌ BAD: Component does everything
const Dashboard = () => {
  // Authentication
  // Data fetching
  // State management
  // Business logic
  // UI rendering
  // Event handlers
  return <div>1000+ lines</div>;
};
```

### **2. Prop Drilling**
```typescript
// ❌ BAD: Passing props through 5 levels
<Parent>
  <Child1 data={data}>
    <Child2 data={data}>
      <Child3 data={data}>
        <Child4 data={data}>
          <Child5 data={data} />
```

### **3. Inline Styles & Tailwind Soup**
```typescript
// ❌ BAD: 20+ Tailwind classes inline
<div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-2xl hover:bg-white/10 active:bg-white/15 dark:bg-black/5 dark:border-black/10">
  
// ✅ GOOD: Extract to component
const Card = ({ children }: Props) => (
  <div className="card card-interactive">
    {children}
  </div>
);
```

### **4. Magic Numbers & Strings**
```typescript
// ❌ BAD
if (user.level === 4) { }
if (status === "completed") { }

// ✅ GOOD
const VERIFICATION_LEVEL_FULLY_VERIFIED = 4;
const STATUS_COMPLETED = "completed";

if (user.level === VERIFICATION_LEVEL_FULLY_VERIFIED) { }
if (status === STATUS_COMPLETED) { }
```

---

## 🎯 Performance Guidelines

### **Optimization Rules**
1. ✅ Use `React.memo()` for expensive components
2. ✅ Use `useCallback()` for functions passed as props
3. ✅ Use `useMemo()` for expensive calculations
4. ✅ Use `lazy()` and `Suspense` for code splitting
5. ✅ Avoid inline object/array creation in render
6. ✅ Use virtualization for long lists (react-window)

### **Example**
```typescript
// ✅ GOOD: Optimized component
const ExpensiveList = memo(({ items }: { items: Item[] }) => {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.price - b.price),
    [items]
  );
  
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return (
    <div>
      {sortedItems.map(item => (
        <ItemCard key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

---

## 📚 Documentation Standards

### **Component Documentation**
```typescript
/**
 * UserCard - Displays user profile information
 * 
 * @param user - User object containing profile data
 * @param onEdit - Callback when edit button clicked
 * @param isLoading - Shows skeleton loader when true
 * 
 * @example
 * <UserCard 
 *   user={currentUser} 
 *   onEdit={handleEdit}
 *   isLoading={false}
 * />
 */
export const UserCard = ({ user, onEdit, isLoading }: UserCardProps) => {
  // Implementation
};
```

### **Complex Logic Documentation**
```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Calculate verification level based on completed steps
// Level 3 requires ID + bank account verification
const calculateVerificationLevel = (user: User): number => {
  if (user.hasBankAccount && user.hasIdVerified) return 3;
  if (user.hasIdVerified) return 2;
  if (user.hasPhoneVerified) return 1;
  return 0;
};
```

---

## 🔒 Security Best Practices

1. ✅ Never commit API keys or secrets
2. ✅ Use environment variables for sensitive data
3. ✅ Sanitize user inputs
4. ✅ Validate data before database operations
5. ✅ Use HTTPS for all API calls
6. ✅ Implement rate limiting
7. ✅ Use prepared statements for SQL queries
8. ✅ Implement CSRF protection
9. ✅ Validate file uploads
10. ✅ Use Content Security Policy (CSP)

---

## ✅ Summary

**Key Principles:**
1. **Complete backend integration before moving to next feature** (current phase priority)
2. **Replace ALL mock data with real API calls** (no "TODO: wire backend later" comments)
3. **Implement algorithms immediately** (calculations, filters, sorting, validations)
4. Keep files under 700 lines (refactor as you wire backend)
5. Single responsibility per component
6. Extract reusable logic to hooks and utils
7. Extract reusable UI to components
8. Use TypeScript strictly
9. Optimize performance with memo/callback
10. Document complex business logic
11. Follow naming conventions
12. Organize imports properly
13. **Update existing migrations** (avoid creating new ones unless absolutely necessary)
14. **Remove demo/placeholder code as you implement** (not as separate cleanup task)

**When Copilot suggests code, ensure it follows these principles!**

---

**Last Updated**: October 12, 2025  
**Version**: 1.2  
**Phase**: Backend Integration & Data Wiring  
**Status**: Active - Enforce on all new code
